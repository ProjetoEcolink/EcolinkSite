from fastapi import FastAPI
<<<<<<< HEAD
from fastapi.middleware.cors import CORSMiddleware
=======
>>>>>>> origin/master
from core.logging import setup_logging
from core.config import settings

setup_logging()
from transport.http.v1.routes.ping import router as ping_router
from transport.http.v1.routes.echo import router as echo_router
from transport.http.v1.routes.users import router as users_router
<<<<<<< HEAD
from transport.http.v1.routes.lotes import router as lotes_router
=======
>>>>>>> origin/master

app = FastAPI(
    title="Clean Architecture API",
    description="API structured with Clean Architecture principles",
    version="1.0.0"
)

<<<<<<< HEAD
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lotes_router, prefix="/api/v1")
=======
>>>>>>> origin/master
app.include_router(ping_router, prefix="/api/v1")
app.include_router(echo_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
