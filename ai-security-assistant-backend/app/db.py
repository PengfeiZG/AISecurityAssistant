from datetime import datetime
from sqlmodel import SQLModel, Field, create_engine, Session, select

DATABASE_URL = "sqlite:///./chat_history.db"
engine = create_engine(DATABASE_URL, echo=False)

class ChatMessage(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    session_id: str
    role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatSession(SQLModel, table=True):
    id: str = Field(primary_key=True)
    title: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

def init_db():
    SQLModel.metadata.create_all(engine)

def save_message(session_id: str, role: str, content: str):
    with Session(engine) as s:
        msg = ChatMessage(session_id=session_id, role=role, content=content)
        s.add(msg)
        s.commit()

def get_messages(session_id: str):
    with Session(engine) as s:
        return s.exec(select(ChatMessage).where(ChatMessage.session_id == session_id)
                      .order_by(ChatMessage.timestamp)).all()

def create_session(session_id: str, title: str):
    with Session(engine) as s:
        sess = ChatSession(id=session_id, title=title)
        s.add(sess)
        s.commit()

def list_sessions():
    with Session(engine) as s:
        return s.exec(select(ChatSession).order_by(ChatSession.created_at.desc())).all()

def update_session_title(session_id: str, new_title: str):
    from sqlmodel import Session, select
    with Session(engine) as s:
        session_obj = s.exec(select(ChatSession).where(ChatSession.id == session_id)).first()
        if session_obj:
            session_obj.title = new_title
            s.add(session_obj)
            s.commit()
