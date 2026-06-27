from pydantic import BaseModel

# here we have use pydantic because its help use to validata the incoming api data 

class MovieCreate(BaseModel):
    movie_id:int
    movie_title:str
    movie_overview:str
    movie_poster_path:str
    