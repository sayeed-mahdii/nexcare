import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import api from '../../services/api';
import { 
  Star,
  MessageSquare,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react';

const DoctorReviews = () => {
  const [ratings, setRatings] = useState({ ratings: [], averageRating: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await api.get('/ratings/my-doctor-ratings');
      setRatings(response.data.data || { ratings: [], averageRating: 0, totalRatings: 0 });
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRatings = ratings.ratings.filter((r) => {
    if (filter === 'all') return true;
    return r.rating === parseInt(filter);
  });

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratings.ratings.filter(r => r.rating === star).length,
    percentage: ratings.totalRatings > 0 
      ? (ratings.ratings.filter(r => r.rating === star).length / ratings.totalRatings) * 100 
      : 0
  }));

  if (loading) {
    return (
      <DashboardLayout title="Patient Reviews">
        <div className="flex items-center justify-center py-20">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Patient Reviews">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Average Rating Card */}
        <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              <span className="text-4xl font-bold text-gray-900">{ratings.averageRating}</span>
            </div>
            <p className="text-gray-600">Average Rating</p>
            <div className="flex justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(ratings.averageRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Total Reviews Card */}
        <div className="card">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageSquare className="w-8 h-8 text-primary-500" />
              <span className="text-4xl font-bold text-gray-900">{ratings.totalRatings}</span>
            </div>
            <p className="text-gray-600">Total Reviews</p>
          </div>
        </div>

        {/* Rating Distribution Card */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Rating Distribution</h3>
          <div className="space-y-2">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm w-8">{star} ★</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {['all', '5', '4', '3', '2', '1'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All Reviews' : (
              <>
                {f} <Star className="w-3 h-3 fill-current" />
              </>
            )}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {filteredRatings.length === 0 ? (
        <div className="text-center py-20 card">
          <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "Your patients haven't left any reviews yet." 
              : `No ${filter}-star reviews.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRatings.map((review) => (
            <div key={review.id} className="card hover:shadow-elevated transition-shadow">
              <div className="flex items-start gap-4">
                {/* Patient Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {review.patient?.user?.firstName?.[0]}{review.patient?.user?.lastName?.[0]}
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {review.patient?.user?.firstName} {review.patient?.user?.lastName}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Appointment Info */}
                    {review.appointment && (
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(review.appointment.appointmentDate).toLocaleDateString()}
                        </div>
                        <p>{review.appointment.appointmentTime}</p>
                      </div>
                    )}
                  </div>

                  {/* Feedback */}
                  {review.feedback ? (
                    <p className="mt-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                      "{review.feedback}"
                    </p>
                  ) : (
                    <p className="mt-3 text-gray-400 italic text-sm">No written feedback</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorReviews;
