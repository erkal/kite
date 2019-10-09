module Graph.Force.QuadTree exposing (Config, QuadTree(..), Quadrant(..), empty, fromList, getAggregate, insertBy, performAggregate, quadrant, singleton, size, toList)

{-| A quadtree that can store an aggregate in the nodes.
Intended for use in n-body simulation, specifically Barnes-Hut

[[https://en.wikipedia.org/wiki/Barnes%E2%80%93Hut\_simulation#Calculating\_the\_force\_acting\_on\_a\_body](https://en.wikipedia.org/wiki/Barnes%E2%80%93Hut_simulation#Calculating_the_force_acting_on_a_body)](https://en.wikipedia.org/wiki/Barnes%E2%80%93Hut_simulation#Calculating_the_force_acting_on_a_body)

-}

import BoundingBox2d exposing (BoundingBox2d)
import Point2d exposing (Point2d)


type QuadTree aggregate item
    = Empty
    | Leaf { boundingBox : BoundingBox2d, aggregate : aggregate, children : ( item, List item ) }
    | Node
        { boundingBox : BoundingBox2d
        , aggregate : aggregate
        , nw : QuadTree aggregate item
        , ne : QuadTree aggregate item
        , se : QuadTree aggregate item
        , sw : QuadTree aggregate item
        }


type alias Config aggregate vertex =
    { combineVertices : vertex -> List vertex -> aggregate
    , combineAggregates : aggregate -> List aggregate -> aggregate
    , toPoint : vertex -> Point2d
    }


{-| An empty aggregate tree
-}
empty : QuadTree aggregate item
empty =
    Empty


{-| A singleton tree, using () as the aggregate
-}
singleton : (vertex -> Point2d) -> vertex -> QuadTree () vertex
singleton toPoint vertex =
    Leaf
        { boundingBox = BoundingBox2d.singleton (toPoint vertex)
        , children = ( vertex, [] )
        , aggregate = ()
        }


size : QuadTree aggregate vertex -> Int
size qtree =
    case qtree of
        Empty ->
            0

        Leaf leaf ->
            let
                ( _, rest ) =
                    leaf.children
            in
            1 + List.length rest

        Node node ->
            size node.nw + size node.ne + size node.se + size node.sw


insertBy : (vertex -> Point2d) -> vertex -> QuadTree () vertex -> QuadTree () vertex
insertBy toPoint vertex qtree =
    case qtree of
        Empty ->
            Leaf
                { boundingBox = BoundingBox2d.singleton (toPoint vertex)
                , children = ( vertex, [] )
                , aggregate = ()
                }

        Leaf leaf ->
            let
                ( first, rest ) =
                    leaf.children

                newSize =
                    2 + List.length rest

                -- splitting at 32 items seems to be a good choice.
                -- normally, all vertices are put into one large leaf. When it reaches this size
                -- the leaf is split. From then on the node will resize when it encounters a point outside of its bounding box.
                -- resizing is expensive, so we wait a while before splitting. On the other hand, if we never split at all,
                -- we get none of the benefits of using a quadtree.
                maxSize =
                    32
            in
            if newSize >= maxSize then
                let
                    initial =
                        Node
                            { boundingBox = BoundingBox2d.hull leaf.boundingBox (BoundingBox2d.singleton (toPoint vertex))
                            , ne = Empty
                            , se = Empty
                            , nw = Empty
                            , sw = Empty
                            , aggregate = ()
                            }
                in
                List.foldl (insertBy toPoint) initial (first :: rest)

            else
                Leaf
                    { boundingBox = BoundingBox2d.hull leaf.boundingBox (BoundingBox2d.singleton (toPoint vertex))
                    , children = ( vertex, first :: rest )
                    , aggregate = ()
                    }

        Node node ->
            let
                point =
                    toPoint vertex
            in
            if BoundingBox2d.contains point node.boundingBox then
                -- NOTE: writing out the full records here gives ~50% speed increase
                case quadrant node.boundingBox point of
                    NE ->
                        Node
                            { boundingBox = node.boundingBox
                            , aggregate = node.aggregate
                            , ne = insertBy toPoint vertex node.ne
                            , se = node.se
                            , nw = node.nw
                            , sw = node.sw
                            }

                    SE ->
                        Node
                            { boundingBox = node.boundingBox
                            , aggregate = node.aggregate
                            , ne = node.ne
                            , se = insertBy toPoint vertex node.se
                            , nw = node.nw
                            , sw = node.sw
                            }

                    NW ->
                        Node
                            { boundingBox = node.boundingBox
                            , aggregate = node.aggregate
                            , ne = node.ne
                            , se = node.se
                            , nw = insertBy toPoint vertex node.nw
                            , sw = node.sw
                            }

                    SW ->
                        Node
                            { boundingBox = node.boundingBox
                            , aggregate = node.aggregate
                            , ne = node.ne
                            , se = node.se
                            , nw = node.nw
                            , sw = insertBy toPoint vertex node.sw
                            }

            else
                let
                    { minX, minY, maxX, maxY } =
                        BoundingBox2d.extrema node.boundingBox

                    ( width, height ) =
                        BoundingBox2d.dimensions node.boundingBox
                in
                case quadrant node.boundingBox point of
                    NE ->
                        Node
                            { boundingBox = BoundingBox2d.fromExtrema { minX = minX, maxX = maxX + width, minY = minY, maxY = maxY + height }
                            , ne = singleton toPoint vertex
                            , sw = qtree
                            , se = Empty
                            , nw = Empty
                            , aggregate = ()
                            }

                    SE ->
                        Node
                            { boundingBox = BoundingBox2d.fromExtrema { maxY = maxY, minX = minX, maxX = maxX + width, minY = minY - height }
                            , se = singleton toPoint vertex
                            , nw = qtree
                            , sw = Empty
                            , ne = Empty
                            , aggregate = ()
                            }

                    NW ->
                        Node
                            { boundingBox = BoundingBox2d.fromExtrema { maxX = maxX, minY = minY, maxY = maxY + height, minX = minX - width }
                            , nw = singleton toPoint vertex
                            , se = qtree
                            , sw = Empty
                            , ne = Empty
                            , aggregate = ()
                            }

                    SW ->
                        Node
                            { boundingBox = BoundingBox2d.fromExtrema { maxX = maxX, maxY = maxY, minX = minX - width, minY = minY - height }
                            , sw = singleton toPoint vertex
                            , ne = qtree
                            , se = Empty
                            , nw = Empty
                            , aggregate = ()
                            }


type Quadrant
    = NE
    | NW
    | SE
    | SW


quadrant : BoundingBox2d -> Point2d -> Quadrant
quadrant boundingBox point =
    let
        ( midX, midY ) =
            BoundingBox2d.centroid boundingBox |> Point2d.coordinates

        ( x, y ) =
            Point2d.coordinates point
    in
    if y >= midY then
        if x >= midX then
            NE

        else
            NW

    else if x >= midX then
        SE

    else
        SW


fromList : (vertex -> Point2d) -> List vertex -> QuadTree () vertex
fromList toPoint =
    List.foldl (insertBy toPoint) empty


toList : QuadTree x a -> List a
toList qtree =
    case qtree of
        Empty ->
            []

        Leaf leaf ->
            let
                ( first, rest ) =
                    leaf.children
            in
            first :: rest

        Node node ->
            toList node.nw ++ toList node.ne ++ toList node.se ++ toList node.sw


performAggregate : Config aggregate vertex -> QuadTree x vertex -> QuadTree aggregate vertex
performAggregate ({ combineAggregates, combineVertices } as config) vanillaQuadTree =
    case vanillaQuadTree of
        Empty ->
            Empty

        Leaf leaf ->
            let
                ( first, rest ) =
                    leaf.children
            in
            Leaf
                { boundingBox = leaf.boundingBox
                , children = ( first, rest )
                , aggregate = combineVertices first rest
                }

        Node node ->
            let
                newNw =
                    performAggregate config node.nw

                newSw =
                    performAggregate config node.sw

                newNe =
                    performAggregate config node.ne

                newSe =
                    performAggregate config node.se

                subresults =
                    List.filterMap getAggregate [ newNw, newSw, newNe, newSe ]
            in
            case subresults of
                [] ->
                    Empty

                x :: xs ->
                    Node
                        { boundingBox = node.boundingBox
                        , aggregate = combineAggregates x xs
                        , nw = newNw
                        , sw = newSw
                        , ne = newNe
                        , se = newSe
                        }


getAggregate : QuadTree aggregate vertex -> Maybe aggregate
getAggregate qtree =
    case qtree of
        Empty ->
            Nothing

        Leaf { aggregate } ->
            Just aggregate

        Node { aggregate } ->
            Just aggregate
