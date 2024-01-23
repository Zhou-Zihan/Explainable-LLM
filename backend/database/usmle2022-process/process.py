import csv
import pandas as pd

filename = 'USMLE-Step3.csv'


# output:
# - csv
# id, question_stem, question, options

data = pd.read_csv(filename)