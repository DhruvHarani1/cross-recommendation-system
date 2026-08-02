from pydantic import BaseModel
from typing import List  

# here we have use pydantic because its help use to validata the incoming api data 

class MovieCreate(BaseModel):
    movie_id:str
    movie_title:str
    movie_overview:str
    movie_poster_path:str
    
class GameRecommendation(BaseModel):
    # valid date incomming game here 
    game_id:str
    game_title:str
    match_score:float
    # We Can remove this if want for more explaination read movie.md
    explaination:str
    
class MovieToGameResponse(BaseModel):
    # validate game response from Movie
    movie_id:str
    movie_title:str
    recommendations: List[GameRecommendation]