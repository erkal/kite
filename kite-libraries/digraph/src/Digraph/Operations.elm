module Digraph.Operations exposing (..)

import Digraph exposing (..)
import Dict
import Set


union g h =
    let
        prependToVertexNames s =
            getVertices
                >> Dict.foldl
                    (\v -> Dict.insert (s ++ v))
                    Dict.empty

        prependToEdgeNames s =
            getEdges
                >> Dict.foldl
                    (\( v, w ) -> Dict.insert ( (s ++ v), (s ++ w) ))
                    Dict.empty
    in
        Digraph.digraph
            { vertices =
                Dict.union
                    (prependToVertexNames "0-" g)
                    (prependToVertexNames "1-" h)
            , edges =
                Dict.union
                    (prependToEdgeNames "0-" g)
                    (prependToEdgeNames "1-" h)
            , scaleAndTranslate =
                g |> getScaleAndTranslate
            }


induce s g =
    Digraph.digraph
        { vertices =
            g |> getVertices |> Dict.filter (\v _ -> Set.member v s)
        , edges =
            g |> getEdges |> Dict.filter (\( v, w ) _ -> Set.member v s && Set.member w s)
        , scaleAndTranslate =
            g |> getScaleAndTranslate
        }
