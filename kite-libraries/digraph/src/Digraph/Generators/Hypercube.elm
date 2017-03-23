module Digraph.Generators.Hypercube exposing (..)


(~) : Char -> List String -> List String
(~) c =
    List.map (String.cons c)


(~~) : Char -> List ( String, String ) -> List ( String, String )
(~~) c =
    List.map (tupleMap (String.cons c))


tupleMap : (a -> b) -> ( a, a ) -> ( b, b )
tupleMap f pair =
    ( f (Tuple.first pair), f (Tuple.second pair) )


hypercube : Int -> { vertexList : List String, edgeList : List ( String, String ) }
hypercube d =
    case d of
        0 ->
            { vertexList = [ "" ]
            , edgeList = []
            }

        d ->
            let
                h =
                    hypercube (d - 1)

                newVertexList =
                    ('0' ~ h.vertexList) ++ ('1' ~ h.vertexList)

                oldEdgesLifted =
                    ('0' ~~ h.edgeList) ++ ('1' ~~ h.edgeList)

                extraEdges =
                    h.vertexList
                        |> List.map (\v -> ( String.cons '0' v, String.cons '1' v ))
            in
                { vertexList = newVertexList
                , edgeList = oldEdgesLifted ++ extraEdges
                }
