module Graph.Layout exposing (circular)

import Graph exposing (Edge, Graph, Node, NodeId)
import Graph.Extra
import Point2d exposing (Point2d)
import Vector2d exposing (Vector2d)


type alias PositionedGraph n e =
    Graph (PositionedVertex n) e


type alias PositionedVertex n =
    { n | position : Point2d }


zip : List a -> List b -> List ( a, b )
zip =
    List.map2 Tuple.pair


applyPositions : List Point2d -> PositionedGraph n e -> PositionedGraph n e
applyPositions posList g =
    let
        idsWithPositions =
            zip (Graph.nodeIds g) posList
    in
    Graph.Extra.updateNodesBy idsWithPositions
        (\pos vP -> { vP | position = pos })
        g


circular :
    { center : ( Float, Float ), radius : Float }
    -> PositionedGraph n e
    -> PositionedGraph n e
circular { center, radius } g =
    let
        n =
            Graph.size g

        pos i =
            ( radius, (toFloat i / toFloat n) * degrees 360 )
                |> Point2d.fromPolarCoordinates
                |> Point2d.translateBy (Vector2d.fromComponents center)

        posList : List Point2d
        posList =
            List.map pos (List.range 1 n)
    in
    applyPositions posList g
