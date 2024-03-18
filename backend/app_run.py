import re
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


def process_text(user_text):  
    with open('system_prompt.txt') as f:
        system_prompt = f.read()
    with open('reply_prompt.txt') as f:
        reply_prompt = f.read()

    msg = [ 
        {"role": "system", "content": "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Style your responses in Markdown."},
        {"role": "user", "content": system_prompt},
        {"role": "assistant", "content": reply_prompt},
        {"role": "user", "content": user_text},
        # {"role": "assistant", "content": second_reply_prompt},
        # {"role": "user", "content": second_user_prompt}
    ]
    print(msg)
    openai_response = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        max_tokens=2048,
        temperature=0,
        messages=msg,
        # stream=True
    )
    generated_text = openai_response['choices'][0]['message']['content']
    print(generated_text)
      
    matches = re.finditer(r'\d+\) \((.*?)\)\n', generated_text)  
    updated_text = generated_text  
    kv_list = []  
  
    for match in matches:  
        matched_content = match.group(0)  
        content_inside_brackets = match.group(1)  
        kv_item = content_inside_brackets.split('|')  
        kv_item = [kv.strip() for kv in kv_item]  
        kv_dict = {}  
          
        for kv in kv_item:  
            k, v = kv.split(':')  
            kv_dict[k.strip()] = v.strip().split(',')  
        kv_list.append(kv_dict)  
        updated_text = re.sub(re.escape(matched_content), '', updated_text)  
      
    return {"plain_text": updated_text, "reasoning_tuples": kv_list} 

@app.route('/post/chat', methods=['POST'])  
def generate_response():  
    user_input = request.json.get('content')  
    response = process_text(user_input)  
    return jsonify(response)  

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