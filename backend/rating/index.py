"""
API для глобального рейтинга ФутбоЛОЛ.
GET  / — топ-50 игроков
POST / — обновить рейтинг игрока (имя + победа/поражение)
"""

import json
import os
import psycopg2


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            "SELECT player_name, score, wins, losses FROM rating ORDER BY score DESC, wins DESC LIMIT 50"
        )
        rows = cur.fetchall()
        cur.close()
        conn.close()
        leaderboard = [
            {"name": r[0], "score": r[1], "wins": r[2], "losses": r[3]}
            for r in rows
        ]
        return {
            "statusCode": 200,
            "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps({"leaderboard": leaderboard}),
        }

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        name = (body.get("name") or "").strip()[:32]
        won = bool(body.get("won", False))

        if not name:
            return {
                "statusCode": 400,
                "headers": {**CORS, "Content-Type": "application/json"},
                "body": json.dumps({"error": "name required"}),
            }

        delta = 100 if won else 0
        wins_add = 1 if won else 0
        losses_add = 0 if won else 1

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO rating (player_name, score, wins, losses)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (player_name) DO UPDATE
              SET score      = rating.score + EXCLUDED.score,
                  wins       = rating.wins + EXCLUDED.wins,
                  losses     = rating.losses + EXCLUDED.losses,
                  updated_at = NOW()
            RETURNING player_name, score, wins, losses
            """,
            (name, delta, wins_add, losses_add),
        )
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        return {
            "statusCode": 200,
            "headers": {**CORS, "Content-Type": "application/json"},
            "body": json.dumps(
                {"name": row[0], "score": row[1], "wins": row[2], "losses": row[3]}
            ),
        }

    return {"statusCode": 405, "headers": CORS, "body": "Method Not Allowed"}