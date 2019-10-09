module Graph.Layout exposing (circular, topological)

import Direction2d
import Graph exposing (Graph)
import Graph.Extra
import LineSegment2d exposing (LineSegment2d)
import Point2d exposing (Point2d)
import Vector2d


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


topological : LineSegment2d -> PositionedGraph n e -> PositionedGraph n e
topological line maybeAcyclicGraph =
    case Graph.checkAcyclic maybeAcyclicGraph of
        Err _ ->
            maybeAcyclicGraph

        Ok g ->
            let
                leveledIds =
                    Graph.heightLevels g
                        |> List.map (List.map (.node >> .id))

                numberOfLevels =
                    List.length leveledIds

                shift i j =
                    let
                        down =
                            LineSegment2d.vector line
                                |> Vector2d.scaleBy
                                    (toFloat i / toFloat numberOfLevels)

                        right =
                            Vector2d.withLength (toFloat j * 50) Direction2d.positiveX
                    in
                    Vector2d.sum down right

                levelToPosition i j =
                    LineSegment2d.startPoint line
                        |> Point2d.translateBy (shift i j)

                idsWithTheirNewPositions =
                    leveledIds
                        |> List.indexedMap
                            (\i ids ->
                                List.indexedMap
                                    (\j id -> ( id, levelToPosition i j ))
                                    ids
                            )
                        |> List.concat

                upPos newPos vP =
                    { vP | position = newPos }

                upNodesToTheirNewPositions =
                    Graph.Extra.updateNodesBy idsWithTheirNewPositions upPos
            in
            upNodesToTheirNewPositions maybeAcyclicGraph
