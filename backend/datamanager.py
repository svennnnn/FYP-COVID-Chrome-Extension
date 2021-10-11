import os
import psycopg2


DATABASE_URL = os.environ['DATABASE_URL']
conn = psycopg2.connect(DATABASE_URL, sslmode='require')
# try:
#     DATABASE_URL = os.environ['DATABASE_URL']
#     conn = psycopg2.connect(DATABASE_URL, sslmode='require')
# except:
#     print("Database not connected")


cur = conn.cursor()

def create_results(user_email, ip, access_date, user_decision, url, title, ml_result, highlight_result):
    row_data = (user_email, ip, access_date, user_decision, url, title, ml_result, highlight_result)
    new_row = "INSERT INTO user_data(user_email, ip, access_date, user_decision, url, title, ml_result, highlight_result) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
    cur.execute(new_row, row_data)
    conn.commit()




def update_user_decision(user_email, user_decision):
    latest_entry = "SELECT * FROM user_data WHERE user_email = %s ORDER BY id DESC LIMIT 1"
    cur.execute(latest_entry, [user_email])
    result = cur.fetchall()
    for row in result:
        row_number = row[0]
        update_user_answer = """ UPDATE user_data
                               SET
                                   user_decision = %s
                               WHERE
                                   id = %s"""
        values = (user_decision, row_number)
        cur.execute(update_user_answer, values)
        conn.commit()
