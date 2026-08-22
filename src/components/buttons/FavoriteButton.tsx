'use client'
import { useState } from "react"


const FavoriteButton = () => {
    const [favourite , setFavorite] =useState(false) ;
    function handleFavorite (){
      setFavorite(prev=>!prev)
    }
    return (
    
        <button className="btn" onClick={handleFavorite}>
            {favourite?"remove from favourite" :"add to favourite"}
        </button>
    
  )
}

export default FavoriteButton
