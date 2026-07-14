import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageSquare, Send, User } from 'lucide-react';

const BACKEND_URL = 'https://cv-backend-43xl.onrender.com';

interface CommentItem {
    id: string;
    authorName: string;
    content: string;
    createdAt: string;
}

interface DiscussionTabProps {
    positionId: string;
}

export const DiscussionTab: React.FC<DiscussionTabProps> = ({ positionId }) => {
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [inputText, setInputText] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const currentUserName = "Иван Иванов";

    const fetchComments = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/positions/${positionId}/comments`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setComments(data);
            }
        } catch (err) {
            console.error("Ошибка обновления чата");
        }
    };

    useEffect(() => {
        fetchComments();

        const interval = setInterval(() => {
            fetchComments();
        }, 3000);

        return () => clearInterval(interval);
    }, [positionId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        try {
            const res = await fetch(`${BACKEND_URL}/api/positions/${positionId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ authorName: currentUserName, content: inputText })
            });
            if (res.status === 201) {
                setInputText('');
                fetchComments();
            }
        } catch {
            alert('Не удалось отправить сообщение');
        }
    };

    return (
        <div className="card shadow-sm border-top-0 rounded-bottom">
            <div className="card-header bg-light d-flex align-items-center gap-2 py-3">
                <MessageSquare size={18} className="text-primary" />
                <span className="fw-bold text-dark">Обсуждение требований и вакансии</span>
            </div>

            <div className="card-body p-4 bg-white" style={{ height: '350px', overflowY: 'auto' }}>
                {comments.length === 0 ? (
                    <div className="text-center text-muted p-5 small">Здесь пока нет сообщений. Напишите первым!</div>
                ) : (
                    comments.map((msg) => (
                        <div key={msg.id} className="mb-3 d-flex flex-column align-items-start">
                            <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-secondary-subtle text-secondary-emphasis d-flex align-items-center gap-1 py-1 px-2 small">
                  <User size={12} /> {msg.authorName}
                </span>
                                <small className="text-muted" style={{ fontSize: '11px' }}>
                                    {new Date(msg.createdAt).toLocaleTimeString()}
                                </small>
                            </div>
                            <div className="p-3 border rounded bg-light text-dark shadow-xs max-w-100 m-0 p-0 small" style={{ borderRadius: '0px 12px 12px 12px' }}>
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="card-footer bg-light p-3 border-top">
                <form onSubmit={handleSendMessage} className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Задайте вопрос по вакансии (поддерживается **жирный**, *курсив*)..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                    <button className="btn btn-primary d-flex align-items-center gap-1" type="submit">
                        <Send size={14} /> Отправить
                    </button>
                </form>
            </div>
        </div>
    );
};