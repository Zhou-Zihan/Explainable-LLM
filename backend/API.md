## 1. DrugBank数据库-药物信息查询

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
```