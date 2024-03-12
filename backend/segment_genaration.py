import json
import openai
from prompt_library import zero_shot_dialogue_generation_prompt

# input - database/usmle2022.json
# output -

ORGANIZATION =  "org-icQvaPmup2kmIfTdyeCk6pNi"
API_BASE = "https://api.jarvis73.com/v1"
API_KEY = "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"

def read_json(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

def save_to_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def is_valid_json(my_str):
    try:
        json.loads(my_str)
        return True
    except json.JSONDecodeError:
        return False

if __name__ == '__main__':
    test_data = read_json('./database/usmle2022.json')

    openai.organization = ORGANIZATION
    openai.api_base = API_BASE
    openai.api_key = API_KEY
    # 测试get请求
    # print(openai.Model.list())
    # 测试chat对话功能
    i=0
    results = []
    for data in test_data:
        input_string = data['question_stem']
        full_prompt = zero_shot_dialogue_generation_prompt % input_string

        response = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            # response_format={"type": "json_object"},
            messages=[
                {"role": "user", "content": full_prompt}
            ],
            temperature=0.0)

        result = response['choices'][0]['message']['content']

        results.append({
            "id": i,
            "segment": json.loads(result)
        })
        i = i + 1

    save_to_json(results, './database/usmle2022-segment.json')

