import re
import json
import openai
from flask import Flask, jsonify, request, Blueprint, render_template, abort, send_from_directory


openai.api_key = "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"  
openai.api_base = "https://api.jarvis73.com/v1"  

# Initialize the app
app = Flask(__name__)

def requestParse(req_data):
    """解析请求数据并以json形式返回"""
    if req_data.method == "POST":
        if req_data.json != None:
            data = req_data.json
        else:
            data = req_data.form
    elif req_data.method == "GET":
        data = req_data.args
    return data


llm = None


@app.route('/init', methods=['POST'])
# @cross_origin()
def init():
    print('----------------Init----------------')
    global llm
    if llm is not None:
        return jsonify({"message": " already initialized"})
    request_data = requestParse(request)
    return jsonify({"message": "init successfully"})


def process_text(user_arr):  
    with open('system_prompt.txt') as f:
        system_prompt = f.read()
    with open('reply_prompt.txt') as f:
        reply_prompt = f.read()

    prompt_arr = [{"role": item.get('role'), "content": item.get('content')} for item in user_arr]

    msg = [ 
        {"role": "system", "content": "You're an excellent doctor. Follow the user's instructions carefully. Style your responses in Markdown."},
        {"role": "user", "content": system_prompt},
        {"role": "assistant", "content": reply_prompt},
        # {"role": "user", "content": user_arr},
        # {"role": "assistant", "content": second_reply_prompt},
        # {"role": "user", "content": second_user_prompt}
    ]

    msg = msg + prompt_arr

    openai_response = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        max_tokens=2048,
        temperature=0,
        messages=msg,
        # stream=True
    )
    generated_text = openai_response['choices'][0]['message']['content']

    matches = re.findall(r'\{.*?\}', generated_text)
      
    updated_text = generated_text  
    kv_list = []  
  
    for matched_content in matches:
        kv_item_ls = json.loads(matched_content)
        kv_dict = {}
        for k, v in kv_item_ls.items():
            cur_list = v.split(',')
            cur_list = [item.strip() for item in cur_list]
            kv_dict[k] = cur_list

        kv_list.append(kv_dict)  
        
        updated_text = re.sub(re.escape(matched_content), '', updated_text)  
      
    return {"plain_text": updated_text.strip(), "reasoning_tuples": kv_list} 

@app.route('/chat', methods=['POST'])  
def generate_response():  
    user_input = request.json.get('dataset')  
    print(user_input.get('content'))
    response = process_text(user_input.get('content'))  
    return jsonify(response)  


#TypeError: select_usmle_topic() missing 1 required positional argument: 'request'

@app.route('/select_usmle_topic', methods=['GET'])
def select_usmle_topic():
    key = request.args.get('dataset')
    key = int(key)
    # 从/backend/database/usmle2022.json和/backend/database/usmle2022-segment.json中按照 id 拿数据
    # 然后随机返回一个 topic
    dict1 = json.load(open('database/usmle2022.json', 'r', encoding='utf-8'))
    dict2 = json.load(open('database/usmle2022-segment.json', 'r', encoding='utf-8'))

    ans = {}
    ans.update(dict1[key])
    ans.update(dict2[key])
    del ans['question_stem']
    return jsonify(ans)

@app.route('/usmle', methods=['GET'])
def get_usmle_topics():
    data = json.load(open('database/usmle2022.json', 'r', encoding='utf-8'))
    return jsonify(data)

if __name__ == "__main__":
    # app.register_blueprint(datatone_routes.datatone_bp, url_prefix='/datatone')
    # app.register_blueprint(vleditor_routes.vleditor_bp, url_prefix='/vleditor')
    # app.register_blueprint(mmplot_routes.mmplot_bp, url_prefix='/mmplot')

    # app.register_blueprint(debugger_single_routes.debugger_single_bp, url_prefix='/debugger_single')
    # app.register_blueprint(debugger_batch_routes.debugger_batch_bp, url_prefix='/debugger_batch')
    # app.register_blueprint(vis_matrix_routes.vis_matrix_bp, url_prefix='/vis_matrix')
    # app.register_blueprint(test_queries_routes.test_queries_bp, url_prefix='/test_queries')
    # count_15m_intervals('2014-01-04 0:00', '2015-11-07 12:00')
    app.run(host='0.0.0.0', debug=True, threaded=True, port=8047)