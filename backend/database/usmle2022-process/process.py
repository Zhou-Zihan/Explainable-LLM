import json
import pandas as pd
import re

# output:
# - csv/json
# id, question_stem, question, options

filename = 'USMLE-Step3.csv'
data = pd.read_csv(filename)

output = []
idx = 0

filtered_data = data[data['Type of Question'] == 'MC-NJ'].reset_index()
len = int(filtered_data.shape[0])

for idx in range(0, len):
    item = {"key": idx, "question_stem": "", "question": "", "options": []}
    text = filtered_data.loc[idx]["Question"]

    question_match = re.search(r'(.+?)\s*\(A\)', text, re.DOTALL)
    item["question_stem"] = question_match.group(1).strip().replace('\n',' ')

    options_match = re.findall(r'\(([A-Z])\)\s*([^()]+)', text)
    for option in options_match:
        item["options"].append(option[1].replace('\n',''))

    output.append(item)

with open('../temp.json', 'w', encoding='utf-8') as json_file:
    json.dump(output, json_file, ensure_ascii=False, indent=4)

print("saved.")