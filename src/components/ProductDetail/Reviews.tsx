"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";

interface Review {
  id: number;
  product_id: number;
  user_id: number;
  parent_id: number | null;
  rating: number | null;
  text: string;
  created_at: string;
  user_name: string;
  user_avatar: string | null;
}

interface ReviewsProps {
  productId: string | number;
}

const Reviews = ({ productId }: ReviewsProps) => {
  console.log('🔷 Reviews component rendered with productId:', productId);
  const { user, token } = useAuth();
  console.log('👤 Current user:', user);
  console.log('🔑 Current token:', token);
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Форма для нового відгуку
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Форма для коментарів
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  
  // Редагування
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching reviews for product:', productId);
      const response = await fetch(`http://localhost:5000/api/reviews/product/${productId}`);
      console.log('📡 Reviews response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Reviews data:', data);
        console.log('✅ Reviews:', data.reviews);
        if (data.reviews && data.reviews.length > 0) {
          console.log('✅ First review user_id:', data.reviews[0].user_id, 'type:', typeof data.reviews[0].user_id);
        }
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
        setTotalReviews(data.totalReviews || 0);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Reviews response not ok:', response.status, response.statusText, errorData);
        // Встановлюємо порожні дані замість помилки
        setReviews([]);
        setAvgRating(0);
        setTotalReviews(0);
      }
    } catch (error) {
      console.error('❌ Fetch reviews error:', error);
      // Встановлюємо порожні дані замість показу toast
      setReviews([]);
      setAvgRating(0);
      setTotalReviews(0);
    } finally {
      setLoading(false);
      console.log('✓ Reviews loading finished');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('Увійдіть в аккаунт для додавання відгуку');
      router.push('/signin');
      return;
    }
    
    if (!newText.trim()) {
      toast.error('Введіть текст відгуку');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          rating: newRating,
          text: newText
        })
      });
      
      if (response.ok) {
        toast.success('Відгук додано успішно!');
        setNewText("");
        setNewRating(5);
        await fetchReviews();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Помилка додавання відгуку');
      }
    } catch (error) {
      console.error('Submit review error:', error);
      toast.error('Помилка додавання відгуку');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: number) => {
    if (!token) {
      toast.error('Увійдіть в аккаунт для додавання коментарів');
      router.push('/signin');
      return;
    }
    
    if (!replyText.trim()) {
      toast.error('Введіть текст коментаря');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          text: replyText,
          parentId
        })
      });
      
      if (response.ok) {
        toast.success('Коментар додано!');
        setReplyText("");
        setReplyTo(null);
        await fetchReviews();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Помилка додавання коментаря');
      }
    } catch (error) {
      console.error('Submit reply error:', error);
      toast.error('Помилка додавання коментаря');
    }
  };

  const handleUpdateReview = async (reviewId: number) => {
    if (!token) return;
    
    if (!editText.trim()) {
      toast.error('Текст не може бути порожнім');
      return;
    }
    
    try {
      const review = reviews.find(r => r.id === reviewId);
      const isMainReview = review && review.parent_id === null;
      
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: editText,
          rating: isMainReview ? editRating : undefined
        })
      });
      
      if (response.ok) {
        toast.success('Відгук оновлено!');
        setEditingId(null);
        setEditText("");
        await fetchReviews();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Помилка оновлення');
      }
    } catch (error) {
      console.error('Update review error:', error);
      toast.error('Помилка оновлення');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!token) return;
    
    if (!confirm('Ви впевнені, що хочете видалити цей відгук?')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        toast.success('Відгук видалено!');
        await fetchReviews();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Помилка видалення');
      }
    } catch (error) {
      console.error('Delete review error:', error);
      toast.error('Помилка видалення');
    }
  };

  const startEdit = (review: Review) => {
    setEditingId(review.id);
    setEditText(review.text);
    setEditRating(review.rating || 5);
  };

  const renderStars = (rating: number, interactive: boolean = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange && onChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : ''} transition-transform`}
            disabled={!interactive}
          >
            <svg
              className={`w-5 h-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`}
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  const mainReviews = reviews.filter(r => r.parent_id === null);
  const getReplies = (reviewId: number) => reviews.filter(r => r.parent_id === reviewId);

  return (
    <div className="w-full">
      {/* Загальна статистика */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-dark mb-6 pb-4 border-b-2 border-gray-3">
          Відгуки та оцінки покупців
        </h2>
        
        {totalReviews > 0 && (
          <div className="flex items-center gap-6 p-6 bg-gray-1 rounded-lg">
            <div className="text-5xl font-bold text-blue">{avgRating.toFixed(1)}</div>
            <div>
              <div className="flex gap-1 mb-2">
                {renderStars(Math.round(avgRating))}
              </div>
              <p className="text-base text-dark font-medium">
                Середня оцінка
              </p>
              <p className="text-sm text-gray-6">
                На основі {totalReviews} {totalReviews === 1 ? 'відгуку' : 'відгуків'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Форма для нового відгуку */}
      <div className="mb-10 p-6 sm:p-8 bg-white border-2 border-blue rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold text-dark mb-6">
          Залишити відгук
        </h3>
        
        {user ? (
          <form onSubmit={handleSubmitReview}>
            <div className="mb-6">
              <label className="block text-base font-semibold text-dark mb-3">
                Ваша оцінка *
              </label>
              <div className="flex gap-1">
                {renderStars(newRating, true, setNewRating)}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-base font-semibold text-dark mb-3">
                Ваш відгук *
              </label>
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="w-full p-4 border-2 border-gray-3 rounded-lg min-h-[150px] focus:outline-none focus:border-blue transition-colors"
                placeholder="Поділіться своїми враженнями про товар..."
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue text-white font-medium px-8 py-3 rounded-lg hover:bg-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Надсилання...' : 'Відправити відгук'}
            </button>
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg text-gray-6 mb-6">
              Увійдіть в аккаунт, щоб залишити відгук
            </p>
            <button
              onClick={() => router.push('/signin')}
              className="bg-blue text-white font-medium px-8 py-3 rounded-lg hover:bg-blue-dark transition-colors"
            >
              Увійти
            </button>
          </div>
        )}
      </div>

      {/* Список відгуків */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-6">Завантаження відгуків...</p>
        </div>
      ) : mainReviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-6">Поки що немає відгуків. Будьте першим!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {mainReviews.map((review) => (
            <div key={review.id} className="border-b border-gray-3 pb-6">
              {/* Основний відгук */}
              <div className="flex gap-4">
                {/* Аватар */}
                <div className="flex-shrink-0">
                  {review.user_avatar ? (
                    <Image
                      src={review.user_avatar}
                      alt={review.user_name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-3 flex items-center justify-center">
                      <span className="text-lg font-semibold text-gray-6">
                        {review.user_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Контент відгуку */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-dark">{review.user_name}</h4>
                      <p className="text-sm text-gray-6">
                        {new Date(review.created_at).toLocaleDateString('uk-UA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    {(() => {
                      console.log(`🔍 Review ${review.id}: user.id=${user?.id} (${typeof user?.id}), review.user_id=${review.user_id} (${typeof review.user_id}), match=${user && user.id === review.user_id}`);
                      return user && user.id === review.user_id;
                    })() && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(review)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Редагувати
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-sm text-red hover:underline"
                        >
                          Видалити
                        </button>
                      </div>
                    )}
                  </div>

                  {review.rating && (
                    <div className="mb-2">
                      {renderStars(review.rating)}
                    </div>
                  )}

                  {editingId === review.id ? (
                    <div className="mt-3">
                      {review.rating && (
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-dark mb-2">
                            Оцінка
                          </label>
                          {renderStars(editRating, true, setEditRating)}
                        </div>
                      )}
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-3 border border-gray-3 rounded-lg min-h-[80px] mb-2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateReview(review.id)}
                          className="bg-red text-white px-4 py-2 rounded text-sm hover:bg-red/90"
                        >
                          Зберегти
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditText("");
                          }}
                          className="bg-gray-3 text-dark px-4 py-2 rounded text-sm hover:bg-gray-4"
                        >
                          Скасувати
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-body leading-relaxed">{review.text}</p>
                  )}

                  {/* Кнопка відповісти */}
                  {user && editingId !== review.id && (
                    <button
                      onClick={() => setReplyTo(replyTo === review.id ? null : review.id)}
                      className="mt-3 text-sm text-red hover:underline"
                    >
                      {replyTo === review.id ? 'Скасувати' : 'Відповісти'}
                    </button>
                  )}

                  {/* Форма відповіді */}
                  {replyTo === review.id && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="w-full p-3 border border-gray-3 rounded-lg min-h-[80px] mb-2"
                        placeholder="Ваш коментар..."
                      />
                      <button
                        onClick={() => handleSubmitReply(review.id)}
                        className="bg-red text-white px-4 py-2 rounded text-sm hover:bg-red/90"
                      >
                        Відправити коментар
                      </button>
                    </div>
                  )}

                  {/* Відповіді (коментарі) */}
                  {getReplies(review.id).length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-3 space-y-4">
                      {getReplies(review.id).map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <div className="flex-shrink-0">
                            {reply.user_avatar ? (
                              <Image
                                src={reply.user_avatar}
                                alt={reply.user_name}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-3 flex items-center justify-center">
                                <span className="text-sm font-semibold text-gray-6">
                                  {reply.user_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <h5 className="font-medium text-dark text-sm">{reply.user_name}</h5>
                                <p className="text-xs text-gray-6">
                                  {new Date(reply.created_at).toLocaleDateString('uk-UA')}
                                </p>
                              </div>
                              
                              {user && user.id === reply.user_id && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => startEdit(reply)}
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    Редагувати
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReview(reply.id)}
                                    className="text-xs text-red hover:underline"
                                  >
                                    Видалити
                                  </button>
                                </div>
                              )}
                            </div>

                            {editingId === reply.id ? (
                              <div className="mt-2">
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full p-2 border border-gray-3 rounded-lg min-h-[60px] mb-2 text-sm"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateReview(reply.id)}
                                    className="bg-red text-white px-3 py-1 rounded text-xs hover:bg-red/90"
                                  >
                                    Зберегти
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingId(null);
                                      setEditText("");
                                    }}
                                    className="bg-gray-3 text-dark px-3 py-1 rounded text-xs hover:bg-gray-4"
                                  >
                                    Скасувати
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-body">{reply.text}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
