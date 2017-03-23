module AbstractDigraph exposing (..)

-- MODEL


type alias AbstractDigraph comparable =
    { vertexList : List comparable
    , edgeList : List ( comparable, comparable )
    }


turnVerticesIntoString : AbstractDigraph comparable -> AbstractDigraph String
turnVerticesIntoString g =
    { vertexList = g.vertexList |> List.map toString
    , edgeList = g.edgeList |> List.map (\( s, t ) -> ( toString s, toString t ))
    }
