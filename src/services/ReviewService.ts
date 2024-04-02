import {ReviewDataDTO} from "../DTOs/ReviewDataDTO";
import { ReviewDataSimpleDTO } from "../DTOs/ReviewDataSimpleDTO";
class ReviewService {
    API_NAME = 'http://127.0.0.1:3001/api/v1';
    PATH_NAME = '/users'

    fetchAllReviewsPaginated = async (page?: number, pageSize?: number): Promise<{ reviews: ReviewDataSimpleDTO[], total_pages: number } | null> => {
        const id = localStorage.getItem('USER_ID');
        let url = `${this.API_NAME}${this.PATH_NAME}/${id}/reviews`;
    
        if (page !== undefined && pageSize !== undefined) {
            url += `?page=${page}&pageSize=${pageSize}`;
        }
    
        try {
            const response = await fetch(url);
            const jsonResponse = await response.json();
            const revs: ReviewDataSimpleDTO[] = jsonResponse.reviews.map((review: any) => ({ 
                app_id: review.app_id,
                app_name: review.app_name,
                reviewId: review.review_id,
                review: review.review,
            }));
            
            return {
                reviews: revs,
                total_pages: jsonResponse.total_pages
            };
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    fetchReview = async (appId: string, reviewId: string): Promise<{ review: ReviewDataDTO } | null> => {
        const id = localStorage.getItem('USER_ID');
        try {
            if (!id || !reviewId || !appId) {
                console.error('USER_ID or app id or reviewId is not available');
                return null;
            }
            
            const response = await fetch(`${this.API_NAME}${this.PATH_NAME}/${id}/applications/${appId}/reviews/${reviewId}`);
            const jsonResponse = await response.json();
    
            const reviewData: ReviewDataDTO = {
                app_name: jsonResponse.application.name,
                app_id: jsonResponse.application.id,
                reviewId: jsonResponse.review_id,
                review: jsonResponse.review_text,
                sentences: jsonResponse.sentences.map((sentence: any) => ({
                    id: sentence.id,
                    text: sentence.text,
                    featureData: sentence.featureData,
                    sentimentData: sentence.sentimentData
                }))
            };
    
            return { review: reviewData };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };
    
    


    fetchAllReviewsDetailed = async (): Promise<{ reviews: ReviewDataDTO[] } | null> => {

        const id = localStorage.getItem('USER_ID')

        try {
            const response = await fetch(`${this.API_NAME}${this.PATH_NAME}/detailed?user_id=${id}`);
            const jsonResponse = await response.json();

            const reviews = jsonResponse.reviews.map((item: any) => ({
                app_id: item.app_id,
                app_name: item.app_name,
                id: item.id,
                review: item.review,
                score: item.score,
                date: item.date,
                sentiments: item.sentiments,
                features: item.features,
                analyzed: item.analyzed
            }));

            return { reviews: reviews };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };

    fetchAllReviewsDetailedFromApp = async (appId: string): Promise<{ reviews: ReviewDataDTO[] } | null> => {
        const id = localStorage.getItem('USER_ID')
        try {
            const response = await fetch(`${this.API_NAME}${this.PATH_NAME}/detailed/app?user_id=${id}&app_id=${appId}`);
            const jsonResponse = await response.json();

            const reviews = jsonResponse.reviews.map((item: any) => ({
                app_id: item.app_id,
                app_name: item.app_name,
                id: item.id,
                date: item.date,
                sentiments: item.sentiments,
                features: item.features,
                analyzed: item.analyzed
            }));

            return { reviews: reviews };
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    };


    deleteReview = async (appId: string, reviewId: string) => {
        const id = localStorage.getItem('USER_ID')
        try {
            await fetch(`${this.API_NAME}${this.PATH_NAME}/${id}/applications/${appId}/reviews/${reviewId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error("Error deleting review:", error);
            throw error;
        }
    };

    analyzeReviews = async (
        reviews: ReviewDataSimpleDTO[],
        featureExtraction: boolean,
        sentimentExtraction: boolean,
        featureModel: string | null,
        sentimentModel: string | null
    ) => {
        const id = localStorage.getItem('USER_ID');
    
        let url = `${this.API_NAME}${this.PATH_NAME}/${id}/analyze?`;
    
        if (featureExtraction) {
            url += `featureExtraction=true&`;
            if (featureModel) {
                url += `feature_model=${featureModel}&`;
            }
        }
    
        if (sentimentExtraction) {
            url += `sentimentExtraction=true&`;
            if (sentimentModel) {
                url += `sentiment_model=${sentimentModel}&`;
            }
        }
    
        const jsonBody = reviews.map(review => ({ "reviewId": review.reviewId }));
    
        try {
            await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(jsonBody)
            });
        } catch (error) {
            console.error("Error analyzing reviews:", error);
            throw error;
        }
    };
    
}

export default ReviewService;
