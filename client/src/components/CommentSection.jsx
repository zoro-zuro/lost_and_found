import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Toast from './Toast';
import UserDetailModal from './UserDetailModal';

const Comment = ({ comment, allComments, onReply, setSelectedUserId, setIsModalOpen, currentUser }) => {
  const replies = allComments.filter(c => c.parentId === comment._id);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await onReply(replyText, comment._id);
      setReplyText('');
      setShowReplyInput(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderText = (text) => {
    if (text.includes('match://')) {
      const parts = text.split('View it here:');
      const id = text.split('match://')[1];
      return (
        <div className="flex flex-col gap-2 mt-1">
          <p>{parts[0]}</p>
          <button 
            onClick={() => window.location.href = `/found/${id}`}
            className="btn-primary btn-sm w-fit gap-2 h-8 text-[10px]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            View Record
          </button>
        </div>
      );
    }
    return text;
  };

  return (
    <div className="flex gap-3 group">
      {/* Left Thread Line */}
      <div className="flex flex-col items-center">
        <div 
          onClick={() => {
            if (!comment.isSystemMessage && comment.userId?._id) {
              setSelectedUserId(comment.userId._id);
              setIsModalOpen(true);
            }
          }}
          className={`w-6 h-6 rounded-sm flex items-center justify-center font-bold text-[9px] cursor-pointer shrink-0 transition-transform hover:scale-105 ${
            comment.isSystemMessage ? 'bg-primary/20 text-primary' : 'bg-muted-text/10 text-muted-text'
          }`}
        >
          {comment.isSystemMessage ? 'P' : comment.userId?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 w-0.5 bg-border/40 my-1 group-last:bg-transparent"></div>
      </div>

      <div className="flex-1 pb-2">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span 
            className={`text-[11px] font-bold tracking-tight cursor-pointer hover:underline ${
              comment.isSystemMessage ? 'text-primary' : 'text-text'
            }`}
             onClick={() => {
              if (!comment.isSystemMessage && comment.userId?._id) {
                setSelectedUserId(comment.userId._id);
                setIsModalOpen(true);
              }
            }}
          >
            {comment.isSystemMessage ? 'System' : comment.userId?.name}
          </span>
          <span className="text-[10px] text-muted-text font-medium opacity-40 uppercase">
            • {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className={`text-[12.5px] mt-1 leading-relaxed bg-surface border border-border/60 shadow-sm px-3 py-2 rounded-lg ${comment.isSystemMessage ? 'text-primary italic border-primary/20' : 'text-text'}`}>
          {renderText(comment.text)}
        </div>

        <div className="flex items-center gap-4 mt-1">
          {!comment.isSystemMessage && (
            <button 
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-[9px] font-bold text-muted-text/60 hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-tighter"
            >
              Reply
            </button>
          )}
        </div>

        {showReplyInput && (
          <div className="mt-3 animate-fade-in relative max-w-md">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="w-full rounded-md border border-border bg-bg p-2 text-[12px] focus:ring-2 focus:ring-primary/10 outline-none min-h-[60px] resize-none"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
               <button 
                onClick={() => setShowReplyInput(false)}
                className="text-[10px] font-bold text-muted-text uppercase p-1 hover:bg-muted-text/5 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={handleReplySubmit}
                disabled={isSubmitting || !replyText.trim()}
                className="btn-primary h-7 px-3 text-[10px] !rounded-md"
              >
                {isSubmitting ? '...' : 'Post Reply'}
              </button>
            </div>
          </div>
        )}

        {/* Render Replies */}
        {replies.length > 0 && (
          <div className="mt-2 space-y-1">
            {replies.map(reply => (
              <Comment 
                key={reply._id} 
                comment={reply} 
                allComments={allComments}
                onReply={onReply}
                setSelectedUserId={setSelectedUserId}
                setIsModalOpen={setIsModalOpen}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CommentSection = ({ itemId, itemType }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchComments();
  }, [itemId]);

  const fetchComments = async () => {
    try {
      const res = await API.get(`/api/comments/${itemType}/${itemId}`);
      setComments(res.data.data);
    } catch (err) {
      console.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (text, parentId = null) => {
    if (!text.trim()) return;

    if (!parentId) setSubmitting(true);
    try {
      const res = await API.post(`/api/comments/${itemType}/${itemId}`, { 
        text,
        parentId
      });
      setComments([...comments, res.data.data]);
      if (!parentId) setNewComment('');
    } catch (err) {
      setToast({ message: 'Failed to post message', type: 'error' });
      throw err;
    } finally {
      if (!parentId) setSubmitting(false);
    }
  };

  const rootComments = comments.filter(c => !c.parentId);

  return (
    <div className="mt-8">
      <h3 className="text-h2 font-bold text-text mb-6">Messages & Updates</h3>
      
      <div className="space-y-4 mb-10 overflow-hidden">
        {rootComments.length === 0 && !loading && (
          <p className="text-muted-text text-small italic opacity-60">No messages yet on this case.</p>
        )}
        
        {rootComments.map((comment) => (
          <Comment 
            key={comment._id} 
            comment={comment} 
            allComments={comments}
            onReply={handleSubmit}
            setSelectedUserId={setSelectedUserId}
            setIsModalOpen={setIsModalOpen}
            currentUser={user}
          />
        ))}
      </div>

      <div className="pt-6 border-t border-border/50">
        <label className="text-[11px] font-bold text-muted-text uppercase tracking-widest block mb-3">Join the conversation</label>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(newComment); }} className="relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a public message..."
            className="w-full rounded-[16px] border border-border bg-surface shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary p-4 pr-24 resize-none min-h-[90px] text-small"
            required
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="absolute bottom-3 right-3 btn-primary btn-md !h-9 text-[11px] px-5"
          >
            {submitting ? '...' : 'Post Message'}
          </button>
        </form>
      </div>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <UserDetailModal 
        userId={selectedUserId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default CommentSection;
