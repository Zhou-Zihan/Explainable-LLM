import os
import re
import json
from openai import OpenAI
import sqlite3  
import requests
from fuzzywuzzy import process  
from flask import Flask, jsonify, request, Blueprint, render_template, abort, send_from_directory
from dotenv import load_dotenv
load_dotenv()

os.environ["OPENAI_API_KEY"] = "sk-proj-WRntFT01XWQKkHE26sooT3BlbkFJ1iT5KOcXMcz7LTZd4XPO"
os.environ["http_proxy"] = "http://127.0.0.1:7890"
os.environ["https_proxy"] = "http://127.0.0.1:7890"
client = OpenAI()
client.base_url = os.getenv('OPENAI_API_BASE')
umls_api_key = os.getenv('UMLS_API_KEY')


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
    with open('system_prompt.txt', 'r', encoding='utf-8') as f:
        system_prompt = f.read()
    with open('reply_prompt.txt', 'r', encoding='utf-8') as f:
        reply_prompt = f.read()

    prompt_arr = [{"role": item.get('role'), "content": item.get('content')} for item in user_arr]
    print("prompt_arr:",prompt_arr)
    msg = [ 
        {"role": "system", "content": "You're an excellent doctor. Follow the user's instructions carefully. Style your responses in Markdown."},
        {"role": "user", "content": system_prompt},
        {"role": "assistant", "content": reply_prompt},
        # {"role": "user", "content": user_arr},
        # {"role": "assistant", "content": second_reply_prompt},
        # {"role": "user", "content": second_user_prompt}
    ]

    msg = msg + prompt_arr

    openai_response = client.chat.completions.create(
        model='gpt-3.5-turbo',
        max_tokens=2048,
        temperature=0,
        messages=msg,
        # stream=True
    )
    generated_text = openai_response.choices[0].message.content
    print("generated_text:",generated_text)
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
    plain_text=updated_text.strip()
    if plain_text == "":
        plain_text = "Thank you for your information! My medical reasoning based on your description is shown in the illustration view."
    print("updated_text:",plain_text)
    return {"plain_text": plain_text, "reasoning_tuples": kv_list} 

@app.route('/chat', methods=['POST'])  
def generate_response():  
    user_input = request.json.get('dataset')  
    print("user_input:",user_input.get('content'))
    response = process_text(user_input.get('content')) 
    
    print("response",response)
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

def get_cui_and_title(content):
    url = 'https://uts-ws.nlm.nih.gov/rest/search/current'
    params = {
        'string': content,
        'apiKey': umls_api_key
    }
    response = requests.get(url, params=params)
    search_result = response.json().get('result').get('results')[0]
    CUI = search_result.get('ui')
    title = search_result.get('name')
    return CUI, title

def get_definitions(CUI):
    third_url = f'https://uts-ws.nlm.nih.gov/rest/content/current/CUI/{CUI}/definitions'

    params = {
        'apiKey': umls_api_key,
    }

    response = requests.get(third_url, params=params)
    priority = ['MSH', 'HPO', 'NCI']  
      
    # 用于存储不以"MSH"开头的第一个对象  
    first_non_msh = None  
    for obj in response.json().get('result'):  
        root_source = obj.get('rootSource', '')  
          
        if root_source in priority:  
            return obj.get('value')
          
        if not first_non_msh and not root_source.startswith('MSH'):  
            first_non_msh = obj  
      
    return first_non_msh.get('value')

def get_relations(CUI, label):
    second_url = f'https://uts-ws.nlm.nih.gov/rest/content/current/CUI/{CUI}/relations'

    params = {
        'apiKey': umls_api_key,
        'includeAdditionalRelationLabels': label
    }

    response = requests.get(second_url, params=params)
    return [item.get('relatedIdName') for item in response.json().get('result')]

def get_symptom_result(content):
    CUI, title = get_cui_and_title(content)
    print("CUI:",CUI,"title:",title)
    ans = {
        'Symptom': title,
        'Definitions': get_definitions(CUI),
        'Relationship': {
            'clinically_associated_with': get_relations(CUI, 'clinically_associated_with')
        }
    }
    return jsonify(ans)

def get_diagnosis_result(content):
    CUI, title = get_cui_and_title(content)
    ans = {
        'Diagnosis': title,
        'Definitions': get_definitions(CUI),
        'Relationship': {
            'may_be_treated_by': get_relations(CUI, 'may_be_treated_by')
        }
    }
    return jsonify(ans)

def get_drugs_list():  
    # 连接到SQLite数据库  
    conn = sqlite3.connect('database/full_database.db')  
    cursor = conn.cursor()  
      
    # 查询所有drugbank_id和name  
    query = "SELECT drugbank_id, name FROM drugs"  
    cursor.execute(query)  
      
    # 获取所有结果  
    drugs_list = cursor.fetchall()  
      
    # 关闭数据库连接  
    cursor.close()  
    conn.close()  
      
    return drugs_list  
  
def get_best_match_drug_id(content, drugs_list):  
    # 使用fuzzywuzzy找到最匹配的name  
    best_match = process.extractOne(content, dict(drugs_list))  
    # 返回最匹配的drugbank_id  
    return best_match[2]  # best_match的格式是 (匹配的文本, 匹配得分, 匹配项的索引)  
  
def get_full_drug_info(drugbank_id):  
    # 再次连接数据库，根据drugbank_id获取完整信息  
    conn = sqlite3.connect('database/full_database.db')  
    cursor = conn.cursor()  
      
    query = "SELECT * FROM drugs WHERE drugbank_id = ?"  
    cursor.execute(query, (drugbank_id,))  
      
    # 获取查询结果  
    row = cursor.fetchone()  
      
    # 关闭数据库连接  
    cursor.close()  
    conn.close()  
      
    return row  

def get_related_products(drugbank_id):  
    conn = sqlite3.connect('database/full_database.db')  
    cursor = conn.cursor()  
      
    # 查询与drugbank_id相关的所有产品名称  
    query = "SELECT DISTINCT name FROM Products WHERE drugbank_id = ?"  
    cursor.execute(query, (drugbank_id,))  
      
    # 获取所有结果，并提取产品名称  
    products = cursor.fetchall()  
    product_names = [product[0] for product in products]  
      
    cursor.close()  
    conn.close()  
      
    return product_names

def get_food_interaction(drugbank_id):
    conn = sqlite3.connect('database/full_database.db')
    cursor = conn.cursor()

    query = "SELECT * FROM FoodInteraction WHERE drugbank_id = ?"

    cursor.execute(query, (drugbank_id,))

    food_interactions = cursor.fetchall()
    food_interaction_list = '\n'.join([food[1] for food in food_interactions])
    return food_interaction_list

def get_drug_interaction(drugbank_id):
    conn = sqlite3.connect('database/full_database.db')
    cursor = conn.cursor()

    query = "SELECT name_anti, drugInteraction_description FROM DrugInteraction WHERE drugbank_id = ?"

    cursor.execute(query, (drugbank_id,))

    drug_interactions = cursor.fetchall()

    drug_interaction_list = []
    for drug_interaction in drug_interactions:
        drug_interaction_dict = {
            "drug_inter": '',
            "drug_name": drug_interaction[0],
            "detail_info": drug_interaction[1]
        }
        detail_info = drug_interaction[1].lower()  # 转换为小写，以便于比较  
        if "risk" in detail_info and "combined with" in detail_info:  
            drug_interaction_dict['drug_inter'] = 'increasing risk of combined use'  
        elif "efficacy" in detail_info and "increase" in detail_info:
            drug_interaction_dict['drug_inter'] = 'increasing efficacy of combined use'  
        elif "efficacy" in detail_info and "decrease" in detail_info:
            drug_interaction_dict['drug_inter'] = 'decreasing efficacy of combined use'  
        elif "increase" in detail_info and "activities" in detail_info:  
            drug_interaction_dict['drug_inter'] = 'increase activity'  
        elif "decrease" in detail_info and "activities" in detail_info:  
            drug_interaction_dict['drug_inter'] = 'decrease activity'  
        else:  
            drug_interaction_dict['drug_inter'] = 'unknown'  
        drug_interaction_list.append(drug_interaction_dict)
    return drug_interaction_list


def get_treatment_result(content):
    drugs_list = get_drugs_list()
    best_match_id = get_best_match_drug_id(content, drugs_list)  
    full_drug_info = get_full_drug_info(best_match_id)  

    ans = {
        "Treatment": full_drug_info[1],
        "Definitions": full_drug_info[2],
        "Indication": full_drug_info[3],
        "Related_Product": get_related_products(best_match_id),
        "Adverse_Effects": [],
        "Food_Interaction": get_food_interaction(best_match_id),
        "Drug_Interaction": get_drug_interaction(best_match_id)
    }
    return jsonify(ans)

def get_complication_result(content):
    CUI, title = get_cui_and_title(content)
    ans = {
        'Complication': title,
        'Definitions': get_definitions(CUI),
    }
    return jsonify(ans)

@app.route('/node', methods=['POST'])
def get_node():
    # type = request.json.get('type')
    # content = request.json.get('content')
    data = request.get_json()
    dataset = data.get("dataset")
    type = dataset.get('type')
    content = dataset.get('content')
    print(data)
    print(type)
    print(content)
    if type == 'Symptom':
        return get_symptom_result(content)
    elif type == 'Diagnosis':
        return get_diagnosis_result(content)
    elif type == 'Treatment':
        return get_treatment_result(content)
    elif type == 'Complication':
        return get_complication_result(content)
    else:
        return jsonify({"message": "unknown type"})

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