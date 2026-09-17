import { useState, FormEvent } from 'react';
import { X, Send, Heart, MessageCircle } from 'lucide-react';
import { Post, Comment } from '../../types';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onAddComment: (postId: string, text: string) => void;
}

export function CommentsModal({
  isOpen,
  onClose,
  post,
  onAddComment,
}: CommentsModalProps) {
  const [commentText, setCommentText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText.trim());
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#191c22] border border-[#272a31] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#272a31] flex items-center justify-between bg-[#10131a]">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-[#ff4f73]" />
            <h3 className="font-bold text-base text-white">
              Comentários ({post.comments.length})
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#272a31] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Comment list */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {post.comments.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              Nenhum comentário ainda. Seja o primeiro a comentar!
            </div>
          ) : (
            post.comments.map((comment: Comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <img
                  src={comment.avatarUrl}
                  alt={comment.author}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#272a31]"
                />
                <div className="flex-1 min-w-0 bg-[#0b0e14] p-3 rounded-xl border border-[#272a31]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">
                      {comment.author}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {comment.createdAt}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-400">
                    <button className="flex items-center gap-1 hover:text-[#ff4f73]">
                      <Heart size={13} />
                      <span>{comment.likes}</span>
                    </button>
                    <span>•</span>
                    <button className="hover:underline">Responder</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input bar */}
        <form
          onSubmit={handleSubmit}
          className="p-3 sm:p-4 border-t border-[#272a31] bg-[#10131a] flex items-center gap-2"
        >
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"
            alt="Seu avatar"
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Deixe um elogio ou comentário..."
            className="flex-1 h-10 px-3.5 rounded-full bg-[#191c22] border border-[#272a31] text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#ff4f73]"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="w-10 h-10 rounded-full bg-[#ff4f73] text-white flex items-center justify-center shrink-0 hover:bg-[#ff4f73]/90 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
