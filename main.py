from fastapi import FastAPI
from routes import upload, extract, generate, review, submit, history
from db import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Co-Pilot for Walmart Sellers")

app.include_router(upload.router)
app.include_router(extract.router)
app.include_router(generate.router)
app.include_router(review.router)
app.include_router(submit.router)
app.include_router(history.router)