from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import subprocess
import tempfile
import os
import re

code_executor_bp = Blueprint('code_executor', __name__)

@code_executor_bp.route('/api/run-cpp', methods=['POST'])
@jwt_required()
def run_cpp_code():
    try:
        data = request.json
        code = data.get('code', '')
        function_name = data.get('function_name', 'twoSum')
        test_cases = data.get('test_cases', [])
        
        # Remove any existing main function from user code
        code = re.sub(r'int\s+main\s*\([^)]*\)\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', '', code, flags=re.DOTALL)
        # Remove #include statements from user code (we'll add our own)
        code = re.sub(r'#include\s*<[^>]+>', '', code)
        
        results = []
        
        for tc in test_cases:
            input_str = tc.get('input', '')
            
            # Parse input to extract nums and target
            nums_match = re.search(r'vector<int> nums = \{([^}]+)\}', input_str)
            target_match = re.search(r'target = (\d+)', input_str)
            
            nums_content = nums_match.group(1) if nums_match else ""
            target_value = target_match.group(1) if target_match else "0"
            
            # Create complete C++ program WITHOUT duplicate main
            full_code = f'''#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

{code}

int main() {{
    vector<int> nums = {{{nums_content}}};
    int target = {target_value};
    Solution sol;
    vector<int> result = sol.{function_name}(nums, target);
    cout << "[";
    for(size_t i = 0; i < result.size(); i++) {{
        if(i > 0) cout << ",";
        cout << result[i];
    }}
    cout << "]";
    return 0;
}}
'''
            # Write to temp file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.cpp', delete=False, encoding='utf-8') as f:
                f.write(full_code)
                cpp_file = f.name
                exe_file = cpp_file.replace('.cpp', '.exe')
            
            # Compile
            compile_result = subprocess.run(
                ['g++', cpp_file, '-o', exe_file],
                capture_output=True, text=True
            )
            
            if compile_result.returncode != 0:
                results.append({
                    'test': tc.get('id', 1),
                    'passed': False,
                    'input': input_str,
                    'expected': tc.get('expected', ''),
                    'output': compile_result.stderr,
                    'error': True
                })
                os.unlink(cpp_file)
                continue
            
            # Run
            try:
                run_result = subprocess.run(
                    [exe_file], capture_output=True, text=True, timeout=5
                )
                output = run_result.stdout.strip()
                expected = tc.get('expected', '')
                passed = output == expected
            except subprocess.TimeoutExpired:
                output = "Time Limit Exceeded"
                passed = False
            
            results.append({
                'test': tc.get('id', 1),
                'passed': passed,
                'input': input_str,
                'expected': expected,
                'output': output,
                'error': False
            })
            
            # Cleanup
            try:
                os.unlink(cpp_file)
                if os.path.exists(exe_file):
                    os.unlink(exe_file)
            except:
                pass
        
        passed_count = sum(1 for r in results if r['passed'])
        
        return jsonify({
            'results': results,
            'passed_tests': passed_count,
            'total_tests': len(test_cases),
            'all_passed': passed_count == len(test_cases)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500