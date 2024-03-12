zero_shot_dialogue_generation_prompt = '''
You are given a question stem in medical domain. Imagine you are the patient, take the question stem as your description of your illness, and divide your information into different ascpects according to the categories below:
medical history: identification and demographics, chief complaint, history of present illness, past medical history, review of systems, family diseases, childhood diseases, social diseases, allergies,...
physical examination: vital signs, laboratory studies, ...

OUTPUT should be returned in json format as: [{"classification": "...", "description": "..."},  {"classification": "...", "description": "..."}]. "classification" should be structured like "medical history-past medical history", "medical history-social diseases", "physical examination-laboratory studies". "description" should be original complete sentence copy from question stem and described from a first-person perspective, content that belongs to the same small classification should be merged together.

Question stem:
%s
'''

# write a few-shot prompt for dialogue generation  (e.g. 5-shot)

few_shot_dialogue_generation_prompt = '''

'''