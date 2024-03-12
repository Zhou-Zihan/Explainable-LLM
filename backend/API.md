## 1. ChatView-对话

#### 接口

- `post/chat`

#### 参数格式

| 参数项        | 格式    | 示例                |
|------------|-------| ------------------- |
| `content` | `str` | `I am a 32-year-old woman who came to the emergency department because of a 3-day history of worsening fever, dry cough, and shortness of breath. I also have had abdominal discomfort, diarrhea, and nausea, but I have not vomited. I wonder know what is the most appropriate intravenous pharmacotherapy at this time. (A) Cefuroxime alone (B) Cefuroxime and azithromycin (C) Levofloxacin alone (D) Levofloxacin and ticarcillin (E) Piperacillin-tazobactam` | 

#### 备注

多轮对话

#### 返回格式

```json
{
  "plain_text": "Given the patient's symptoms of fever, dry cough, and shortness of breath, along with abdominal discomfort, diarrhea, and nausea, the initial diagnosis points towards a respiratory infection with a possible complication involving the gastrointestinal system. The most appropriate intravenous pharmacotherapy in this case would be a combination of Levofloxacin and ticarcillin to target the respiratory infection and address the possible complications involving the gastrointestinal symptoms.So, the answer is (D) Levofloxacin and ticarcillin.",
  "reasoning_tuples":[
    {
      "Symptom":["Fever", "Dry Cough", "Shortness of Breath"],
      "Diagnosis":"Respiratory Infection"
    },
    {
      "Symptom":["Fever", "Dry Cough", "Shortness of Breath"],
      "Diagnosis":"Respiratory Infection",
      "Complication":"Gastrointestinal Symptoms"
    },
    {
      "Symptom":["Fever", "Dry Cough", "Shortness of Breath"],
      "Diagnosis":"Respiratory Infection",
      "Treatment-Medication":"Levofloxacin and ticarcillin"
    }
  ]
}
```

## 2. ChatView-选择USMLE题目作为对话内容

#### 接口

- `get/select_usmle_topic`

#### 参数格式

| 参数项        | 格式    | 示例                |
|------------|-------| ------------------- |
| `id` | `int` | `0` |

#### 备注

从`/backend/database/usmle2022.json`和`/backend/database/usmle2022-segment.json`中按照id拿数据


#### 返回格式

```json
{
  "id": 0,
  "question": "Which of the following microorganisms is most likely to have caused this patient's symptoms?",
  "options": [
      "Adenovirus",
      "Borrelia burgdorferi",
      "Coxsackievirus",
      "Ehrlichia chaffeensis",
      "Parvovirus B19"
  ],
  "segment": [
    {
      "classification": "medical history-identification and demographics",
      "description": "I am a 30-year-old woman."
    },
    {
      "classification": "medical history-chief complaint",
      "description": "I am here because of a 3-day history of joint pain in my hands and a rash over my chest and arms."
    },
    {
      "classification": "medical history-history of present illness",
      "description": "The joint pain in my hands has persisted and is exacerbated by writing or typing. I rate the pain as a 3 on a 10-point scale."
    },
    {
      "classification": "medical history-past medical history",
      "description": "My medical history is unremarkable and my only medication is an oral contraceptive."
    },
    {
      "classification": "medical history-social diseases",
      "description": "I am in a monogamous relationship with my husband. I do not smoke cigarettes, drink alcoholic beverages, or use illicit drugs."
    },
    {
      "classification": "medical history-allergies",
      "description": "I do not have any known allergies."
    },
    {
      "classification": "physical examination-vital signs",
      "description": "My vital signs are temperature 38.1°C (100.5°F), pulse 94/min, respirations 18/min, and blood pressure 107/58 mm Hg."
    },
    {
      "classification": "physical examination-laboratory studies",
      "description": "No laboratory studies were mentioned in the question stem."
    }
  ]
}
```

## 3. LOAD CASES - 获取usmle中的所有题目

#### 接口

- `get/usmle`

#### 参数格式

- /

#### 返回格式

- 返回`/backend/database/usmle2022.json`文件内容


## 4. Reference View - 获取node的信息

#### 接口

- `get/`

#### 参数格式

| 参数项        | 格式    | 示例                |
|------------|-------| ------------------- |
| `type` | `str` | `Symptom`/`Diagnosis`/`Treatment`/`Complication` |
|`content`|`str`|`Fever`|

#### 备注
UMLS接口描述：https://documentation.uts.nlm.nih.gov/rest/home.html

1. Type: Symptom
   1. 通过UMLS接口，用content查询CUI的ID
   2. 通过CUI-ID，查询`includeAdditionalRelationLabels=clinically_associated_with`相关的CUI-IDs，并获取CUI-IDs的名字
2. Type: Diagnosis
   1. 通过UMLS接口，用content查询CUI的ID
   2. 通过CUI-ID，查询`includeAdditionalRelationLabels=may_be_treated_by`相关的CUI-IDs，并获取CUI-IDs的名字
3. Type: Treatment
   1. Medication类型的，通过本地数据库查询，用`content`在数据库中模糊搜索
4. Type: Complication
   1. 通过UMLS接口，用content查询CUI的ID
   2. 通过CUI-ID获取基础信息

#### 返回格式

```json
// Type: Symptom
{
  "Symptom": "Dry Cough",
  "Definitions": "A cough that does not produce phlegm or mucus.",
  "Relationship":{
    "clinically_associated_with":["Fever","Respiratory Infection"]
  }
}

//Type: Diagosis
{
  "Diagnosis": "Respiratory Infection",
  "Definitions": "An infection of the upper or lower respiratory tract.",
  "Relationship":{
    "may_be_treated_by":["Levofloxacin","..."],
    // "clinically_associated_with":[]
  }
}

//Type: Treatment - medication
{
  "Treatment": "Lepirudin",
  "Definitions": "Lepirudin is used as an anticoagulant in patients with heparin-induced thrombocytopenia (HIT), an immune reaction associated with a high risk of thromboembolic complications. ",
  "Indication": "For the treatment of Human immunovirus (HIV) infections in conjunction with other antivirals.",
  "Related_Product": "Cophylac Drops(Normethadone + Oxilofrine)",
  "Adverse_Effects":  "....",
  "Food_Interaction": "...",
  "Drug_Interaction": [
    {"drug_inter":"increase activity", "drug_name":"XXX", "detail_info":"..."},
    {"drug_inter":"decrease activity", "drug_name":"XXX", "detail_info":"..."},
    {"drug_inter":"increasing risk of combined use", "drug_name":"XXX", "detail_info":"..."},
  ]
  // "Relationship":{}
}

//Type: Complication
{
  "Complication":"XXX",
  "Definitions":"..."
}
```








<!-- ## 2. DrugBank数据库-药物信息查询

#### 接口

- `post /drug_search`

#### 参数格式

| 参数项        | 格式    | 示例                |
|------------|-------| ------------------- |
| `drugName` | `str` | `Cefuroxime` |

#### 返回格式

```json
{
  "name": "Cefuroxime",
  "description": "....",
  "simple_description": "...",
  //or None
  "clinical_description": "...",
  //or None
  "synonyms": [
    "..",
    "..."
  ],
  "indication": "...",
  "toxicity": "...",
  "ages": {
  },
  "products": ["..",".."],
  "food_interaction":,
  "drug-interaction":
}
``` -->
