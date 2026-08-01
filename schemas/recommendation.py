from typing import Optional
from pydantic import BaseModel
from typing import List  

class RecommendationItem(BaseModel):
    id:str
    type :str
    title:str
    cover_path :Optional[str]=None
    match_score : float
    explanation:str
    class Config:
        from_attributes=True
class RecommendationResponse(BaseModel):
    source_id:str
    source_title:str
    recommendations:List[RecommendationItem]
    class Config: 
        from_attributes = True