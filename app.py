from fastapi import FastAPI, Request
from router.skill_router import SkillRouter
from main import initialize_chatbot

app = FastAPI()
initialize_chatbot()
router = SkillRouter()

@app.post("/webhook")
async def whatsapp_webhook(request: Request):
    data = await request.json()
    user_message = data.get("message", "")
    response = router.route(user_message)
    return {"reply": response}
