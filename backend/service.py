import flask
from flask import request, jsonify
from flask_cors import CORS
import json
from urllib.parse import unquote
import requests
from bs4 import BeautifulSoup
from urllib.request import Request, urlopen
# approach1 - using Cosine Similarity
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer
from nltk.stem.wordnet import WordNetLemmatizer
from nltk.tokenize import sent_tokenize, word_tokenize
import unicodedata
# approach3 - using WordNet
from nltk.corpus import stopwords, wordnet
from itertools import product
import numpy
from urllib.parse import urlparse
import urllib
import re

# FLASK CONFIG
app = flask.Flask(__name__)
app.config["DEBUG"] = True
cors = CORS(app)

import pandas as pd

import numpy as np
from nltk import word_tokenize
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
import spacy
import os
from datetime import datetime

nlp = spacy.load('en_core_web_sm', disable=['parser', 'ner'])
vocabulary = joblib.load('Features_1.pkl')
Model = joblib.load("CovidModel_1.pkl")

import datamanager

def Preprocess(df):
    # remove special characters#
    df = df.replace("[^A-Za-z]+", " ", regex=True).astype(str)
    # remove digits#
    df = df.replace(r'\b\d+\b', ' ', regex=True).astype(str)
    # remove http,https,www digits#
    df = df.replace('https', ' ', regex=True).astype(str)
    df = df.replace('http', ' ', regex=True).astype(str)
    df = df.replace('www', ' ', regex=True).astype(str)
    df = df.replace('com', ' ', regex=True).astype(str)
    # remove single alphabets#
    df = df.replace(r"\b[a-zA-Z]\b", " ", regex=True).astype(str)
    # remove multiple spaces#
    df = df.replace(r'^\s+', '', regex=True).astype(str)
    df = df.replace(' +', ' ', regex=True).astype(str)
    return df


class stemmer(object):
    def __init__(self):
        self.wnl = WordNetLemmatizer()

    def __call__(self, doc):
        return [token.lemma_ for token in nlp(doc)]  # return [self.wnl.lemmatize(t) for t in word_tokenize(doc)]


# SIMILARITY CHECK
class CheckSimilarity(object):
    def __init__(self, article, testdata, source_url, algo):
        self.article = article
        self.testdata = testdata
        self.source_url = source_url

    @property
    def relatedContext(self):
        # Get the title
        try:
            req = Request(self.source_url, headers={'User-Agent': 'Mozilla/5.0'})
            webpage = urlopen(req).read()
            soup = BeautifulSoup(webpage, 'html.parser')
            title = soup.title.text
            text = ''
            for para in soup.find_all('p'):
                text += (para.text)
        except:
            title = ''
            text = self.article

        title = title
        source = self.source_url
        sente2 = []
        # print('Title...',title)
        # print(text)

        df = pd.DataFrame({'title': [title], 'content': [text], 'publication': [source]})
        df['domain'] = ''
        # lower case#
        df = df.apply(lambda x: x.astype(str).str.lower())
        # text#
        Pre_text = Preprocess(df['content'])
        # title#
        Pre_title = Preprocess(df['title'])
        # source#
        # Pre_source = PreprocessDomain(df)
        # Pre_url = Preprocess(Pre_source)
        # print(Pre_url)
        # Data#
        data = Pre_text + Pre_title  # + Pre_url
        # Filter corpus#
        dictionary = ['covid', 'corona', 'coronavirus']  # , '-cov-2','cov2','ncov'
        filter = Pre_text.apply(lambda x: any([k in x for k in dictionary]))

        if filter.any():
            FullData_S = data.to_string(header=False, index=False)
            if not FullData_S:
                r = "Please enter data"
            else:
                vectorizer = TfidfVectorizer(tokenizer=stemmer(), stop_words='english', max_df=0.8, ngram_range=(1, 2),
                                             vocabulary=vocabulary)  # ngram_range=(2,2)
                feature = vectorizer.fit_transform(data)
                result = Model.predict(feature)
                # print('******* Highlighting *********')
                if result[0] == 'fake':
                    Mc = feature.tocoo()
                    di = {k: v for k, v in zip(Mc.col, Mc.data)}
                    sorted_di = dict(sorted(di.items(), key=lambda item: item[1], reverse=True)[:5])  # [:10]
                    values = []
                    for i in sorted_di:
                        values.append(vectorizer.get_feature_names()[i])
                    # print(values)
                    sente = []
                    for i in range(0, len(values)):
                        for sentence in text.split('.'):
                            st = sentence.lower()
                            if st.find(values[i].split(' ')[0]) >= 0:
                                if sentence.strip() not in sente2:
                                    st = re.split(r"[^a-zA-Z0-9\s]", sentence.strip())
                                    sente2.append(sentence.strip())
                                    for elem in st:
                                        if not elem.strip():
                                            st.remove(elem)
                                    sente.append(st[0])
                                    break
                    for i in sente:
                        print('Answer......', i + '\n')
                    related_context = []
                    for i in sente:
                        related_context.append({"sentence": unicodedata.normalize('NFKD', i), "similarityIndex": 0.96})
                else:
                    related_context = []
        else:
            result = ['none']
            related_context = []
        # Save
        dfList = []
        dfList.append([datetime.now(), source, title, result[0].upper(), sente2])
        # dfNew.to_excel(outputFile)

        return result, related_context, dfList


def analyze(user_email, article, testData, source_url, algo):
    context, highlight, dfList = CheckSimilarity(article=article, testdata=testData, source_url=source_url,
                                                 algo=algo).relatedContext
    context = context[0].upper()
    # print(context)

    # Save ip#
    if 'X-Forwarded-For' in request.headers:
        proxy_data = request.headers['X-Forwarded-For']
        ip_list = proxy_data.split(',')
        ip = ip_list[0]  # first address in list is User IP
    else:
        ip = request.remote_addr  # For local development
    # print(ip)

    # Save results#
    if dfList[0][3] != 'NONE':
        access_date = dfList[0][0]
        url = dfList[0][1]
        title = dfList[0][2]
        ml_result = dfList[0][3]
        highlight_result = dfList[0][4]
        user_decision = 'tbd'
        datamanager.create_results(user_email, ip, access_date, user_decision, url, title, ml_result, highlight_result)

    response = {
        "match": len(highlight) > 0,
        "found": 0,
        "yourSearch": testData,
        "resp": highlight,
        "result": context,
        "user": user_email
    }
    # print(response)
    return jsonify(response)


def save_decision(user_email,user_decision):
    datamanager.update_user_decision(user_email, user_decision)
