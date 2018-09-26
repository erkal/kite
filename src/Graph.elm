module Graph exposing
    ( Bag
    , BagId
    , Edge
    , EdgeId
    , Graph
    , Vertex
    , VertexId
    , addBagAndGetNewBagId
    , addEdgeBetweenExistingVertices
    , addNeighbour
    , addNeighbourDevidingEdge
    , addVertexAndGetTheNewVertexId
    , bagElementsInCurlyBraces
    ,  cartesianProduct
       -- VIEW

    , contractEdge
    , devideEdge
    , duplicateSubgraphAndGetTheDuplicate
    ,  empty
       -- ENCODERS

    ,  encodeForD3
       -- QUERIES

    , getBag
    , getBags
    , getBagsWithVertices
    , getCenter
    , getCommonEdgeProperty
    , getCommonVertexProperty
    , getEdge
    , getEdgeIdsIntersectingLineSegment
    , getEdges
    , getEdgesIn
    , getManyBody
    , getMaybeRectAroundVertices
    , getRoundedVertexPosition
    , getVertex
    , getVertexIdsInRect
    , getVertices
    , getVerticesIn
    , getVerticesInBag
    , inducedEdges
    ,  inducedVertices
       -- UPDATES

    , moveCenterX
    , moveCenterY
    , movePullCenterToCenter
    , moveVertices
    , removeBag
    , removeEdges
    , removeVertices
    , updateBag
    , updateEdges
    , updateManyBody
    , updateVertices
    )

import Colision
import Colors exposing (Color)
import Dict exposing (Dict)
import Json.Encode as Encode exposing (Value)
import Set exposing (Set)


{-| The graph type holds the data that the user may export as json.
The GUI-state data does not enter here!
Everything about the GUI is in Main.elm.
-}
type Graph
    = Graph
        { vertices : VertexDict
        , edges : EdgeDict
        , bags : BagDict
        , manyBody : ManyBody
        }


type alias VertexDict =
    Dict VertexId Vertex


type alias VertexId =
    Int


type alias EdgeId =
    ( VertexId, VertexId )


type alias EdgeDict =
    Dict EdgeId Edge


type alias Vertex =
    { x : Float
    , y : Float
    , color : Color
    , radius : Float
    , inBags : Set BagId
    , fixed : Bool
    , userDefinedProperties : Dict String String
    }


type alias Edge =
    { color : Color
    , thickness : Float
    , distance : Float
    , strength : Float
    }


type alias BagDict =
    Dict BagId Bag


type alias BagId =
    Int


type alias Bag =
    { hasConvexHull : Bool
    , pullIsActive : Bool
    , draggablePullCenter : Bool
    , pullX : Float
    , pullY : Float
    , pullXStrength : Float
    , pullYStrength : Float
    }


type alias ManyBody =
    { strength : Float
    , theta : Float
    , distanceMin : Float
    , distanceMax : Float
    }


empty : Graph
empty =
    Graph
        { vertices = Dict.empty
        , edges = Dict.empty
        , bags = Dict.empty
        , manyBody =
            { strength = -100
            , theta = 0.9
            , distanceMin = 1
            , distanceMax = 1000
            }
        }



-- INTERNALS


biggestIdPlusOne : Dict Int a -> VertexId
biggestIdPlusOne =
    Dict.keys
        >> List.maximum
        >> Maybe.withDefault -1
        >> (+) 1


mapVertices : (VertexDict -> VertexDict) -> Graph -> Graph
mapVertices up (Graph p) =
    Graph { p | vertices = up p.vertices }


mapEdges : (EdgeDict -> EdgeDict) -> Graph -> Graph
mapEdges up (Graph p) =
    Graph { p | edges = up p.edges }



-- ENCODERS


encodeForD3 : Graph -> Value
encodeForD3 ((Graph { edges, manyBody }) as graph) =
    Encode.object
        [ ( "vertices", encodeVerticesForD3 graph )
        , ( "edges", encodeEdgesForD3 edges )
        , ( "manyBody", encodeManyBody manyBody )
        ]


encodeVerticesForD3 : Graph -> Value
encodeVerticesForD3 (Graph { vertices, bags }) =
    vertices
        |> Dict.toList
        |> Encode.list (encodeVertexForD3 bags)


encodeVertexForD3 : BagDict -> ( VertexId, Vertex ) -> Value
encodeVertexForD3 bags ( vertexId, { x, y, fixed, inBags } ) =
    Encode.object
        [ ( "id", Encode.int vertexId )
        , ( "x", Encode.float x )
        , ( "y", Encode.float y )
        , ( "pullCenters", encodePullCenters bags (Set.toList inBags) )
        , ( "fx"
          , if fixed then
                Encode.float
                    x

            else
                Encode.null
          )
        , ( "fy"
          , if fixed then
                Encode.float
                    y

            else
                Encode.null
          )
        ]


encodePullCenters : BagDict -> List BagId -> Value
encodePullCenters bags l =
    l
        |> List.filterMap (\bagId -> Dict.get bagId bags)
        |> List.filter .pullIsActive
        |> Encode.list encodePullData


encodePullData : Bag -> Value
encodePullData { pullX, pullY, pullXStrength, pullYStrength } =
    Encode.object
        [ ( "pullX", Encode.float pullX )
        , ( "pullXStrength", Encode.float pullXStrength )
        , ( "pullY", Encode.float pullY )
        , ( "pullYStrength", Encode.float pullYStrength )
        ]


encodeEdgesForD3 : EdgeDict -> Value
encodeEdgesForD3 edges =
    edges
        |> Dict.map encodeEdgeforD3
        |> Dict.values
        |> Encode.list identity


encodeEdgeforD3 : EdgeId -> Edge -> Value
encodeEdgeforD3 ( source, target ) { distance, strength } =
    Encode.object
        [ ( "source", Encode.int source )
        , ( "target", Encode.int target )
        , ( "distance", Encode.float distance )
        , ( "strength", Encode.float strength )
        ]


encodeManyBody : ManyBody -> Value
encodeManyBody { strength, theta, distanceMin, distanceMax } =
    Encode.object
        [ ( "strength", Encode.float strength )
        , ( "theta", Encode.float theta )
        , ( "distanceMin", Encode.float distanceMin )
        , ( "distanceMax", Encode.float distanceMax )
        ]



-- QUERIES


getVertex : VertexId -> Graph -> Maybe Vertex
getVertex vertexId (Graph { vertices }) =
    Dict.get vertexId vertices


getEdge : EdgeId -> Graph -> Maybe Edge
getEdge edgeId (Graph { edges }) =
    Dict.get edgeId edges


getVertices : Graph -> VertexDict
getVertices (Graph { vertices }) =
    vertices


getEdges : Graph -> EdgeDict
getEdges (Graph { edges }) =
    edges


getBags : Graph -> Dict BagId Bag
getBags (Graph { bags }) =
    bags


getBagsWithVertices : Graph -> Dict BagId (List Vertex)
getBagsWithVertices graph =
    let
        cons v bagId acc =
            Dict.update
                bagId
                (Maybe.map ((::) v))
                acc

        handleVertex _ v acc =
            v.inBags
                |> Set.toList
                |> List.foldr (cons v) acc

        initialAcc =
            graph |> getBags |> Dict.map (\_ _ -> [])
    in
    graph
        |> getVertices
        |> Dict.foldr handleVertex initialAcc


getBag : BagId -> Graph -> Maybe Bag
getBag bagId (Graph { bags }) =
    Dict.get bagId bags


updateBag : BagId -> (Bag -> Bag) -> Graph -> Graph
updateBag bagId up (Graph p) =
    Graph { p | bags = Dict.update bagId (Maybe.map up) p.bags }


getManyBody : Graph -> ManyBody
getManyBody (Graph { manyBody }) =
    manyBody


getCenter : Set VertexId -> Graph -> Maybe { x : Float, y : Float }
getCenter l (Graph { vertices }) =
    let
        selectedVertices =
            vertices
                |> Dict.filter (\vertexId _ -> Set.member vertexId l)
                |> Dict.values

        xValues =
            List.map .x selectedVertices

        yValues =
            List.map .y selectedVertices

        n =
            List.length selectedVertices
    in
    if n == 0 then
        Nothing

    else
        Just { x = List.sum xValues / toFloat n, y = List.sum yValues / toFloat n }


bagElementsInCurlyBraces : BagId -> Graph -> String
bagElementsInCurlyBraces bagId graph =
    let
        inside =
            graph
                |> getVerticesInBag bagId
                |> Set.toList
                |> List.map (\vertexId -> String.fromInt vertexId ++ ", ")
                |> String.concat
                |> String.dropRight 2
    in
    "{ " ++ inside ++ " }"


getVerticesIn : Set VertexId -> Graph -> VertexDict
getVerticesIn vertexIds (Graph { vertices }) =
    Dict.filter (\vertexId _ -> Set.member vertexId vertexIds) vertices


getEdgesIn : Set EdgeId -> Graph -> EdgeDict
getEdgesIn edgeIds (Graph { edges }) =
    Dict.filter (\edgeId _ -> Set.member edgeId edgeIds) edges


getCommonVertexProperty : Set VertexId -> (Vertex -> a) -> Graph -> Maybe a
getCommonVertexProperty vertexIds prop graph =
    let
        deleteDuplicates xs =
            case xs of
                x :: rest ->
                    x :: deleteDuplicates (List.filter ((/=) x) rest)

                [] ->
                    []

        l =
            graph
                |> getVerticesIn vertexIds
                |> Dict.values
                |> List.map prop
                |> deleteDuplicates
    in
    case l of
        [ unique ] ->
            Just unique

        _ ->
            Nothing


getCommonEdgeProperty : Set EdgeId -> (Edge -> a) -> Graph -> Maybe a
getCommonEdgeProperty edgeIds prop graph =
    let
        deleteDuplicates xs =
            case xs of
                x :: rest ->
                    x :: deleteDuplicates (List.filter ((/=) x) rest)

                [] ->
                    []

        l =
            graph
                |> getEdgesIn edgeIds
                |> Dict.values
                |> List.map prop
                |> deleteDuplicates
    in
    case l of
        [ unique ] ->
            Just unique

        _ ->
            Nothing


getVerticesInBag : BagId -> Graph -> Set VertexId
getVerticesInBag bagId (Graph { vertices }) =
    vertices
        |> Dict.filter (\_ v -> Set.member bagId v.inBags)
        |> Dict.keys
        |> Set.fromList


getRoundedVertexPosition : VertexId -> Graph -> Maybe { x : Int, y : Int }
getRoundedVertexPosition vertexId (Graph { vertices }) =
    Dict.get vertexId vertices
        |> Maybe.map (\{ x, y } -> { x = round x, y = round y })


inducedEdges : Set VertexId -> Graph -> Set EdgeId
inducedEdges vs (Graph { edges }) =
    edges
        |> Dict.keys
        |> List.filter
            (\( sourceId, targetId ) ->
                Set.member sourceId vs && Set.member targetId vs
            )
        |> Set.fromList


inducedVertices : Set EdgeId -> Graph -> Set VertexId
inducedVertices es (Graph { vertices }) =
    es
        |> Set.toList
        |> List.concatMap (\( s, t ) -> [ s, t ])
        |> Set.fromList


incomingEdges : VertexId -> Graph -> EdgeDict
incomingEdges vertexId (Graph { edges }) =
    edges
        |> Dict.filter (\( s, t ) _ -> vertexId == t)


outgoingEdges : VertexId -> Graph -> EdgeDict
outgoingEdges vertexId (Graph { edges }) =
    edges
        |> Dict.filter (\( s, t ) _ -> vertexId == s)


getVertexIdsInRect : Colision.Rect -> Graph -> Set VertexId
getVertexIdsInRect rect (Graph { vertices }) =
    let
        inRect _ v =
            Colision.collideRectWithCircle rect
                { x = v.x, y = v.y, radius = v.radius }
    in
    vertices
        |> Dict.filter inRect
        |> Dict.keys
        |> Set.fromList


getEdgeIdsIntersectingLineSegment :
    Colision.LineSegment
    -> Graph
    -> Set EdgeId
getEdgeIdsIntersectingLineSegment lineSegment (Graph { vertices, edges }) =
    let
        intersecting ( s, t ) =
            case ( Dict.get s vertices, Dict.get t vertices ) of
                ( Just v, Just w ) ->
                    Colision.collideLineSegments lineSegment
                        ( ( v.x, v.y ), ( w.x, w.y ) )

                _ ->
                    -- Debug.log "GUI ALLOWED SOMETHING IMPOSSIBLE: The endpoints should be there!" <|
                    False
    in
    edges
        |> Dict.keys
        |> List.filter intersecting
        |> Set.fromList


getMaybeRectAroundVertices : Set VertexId -> Graph -> Maybe Colision.Rect
getMaybeRectAroundVertices vertexIds graph =
    let
        extremes =
            getVerticesIn vertexIds graph
                |> Dict.values
                |> List.map
                    (\{ x, y, radius } ->
                        { left = x - radius
                        , top = y - radius
                        , right = x + radius
                        , bottom = y + radius
                        }
                    )

        ( maybeMinx, maybeMiny ) =
            ( extremes |> List.map .left |> List.minimum
            , extremes |> List.map .top |> List.minimum
            )

        ( maybeMaxx, maybeMaxy ) =
            ( extremes |> List.map .right |> List.maximum
            , extremes |> List.map .bottom |> List.maximum
            )
    in
    case ( ( maybeMinx, maybeMiny ), ( maybeMaxx, maybeMaxy ) ) of
        ( ( Just minx, Just miny ), ( Just maxx, Just maxy ) ) ->
            Just
                { x = minx
                , y = miny
                , width = maxx - minx
                , height = maxy - miny
                }

        _ ->
            Nothing



-- UPDATES


updateManyBody : (ManyBody -> ManyBody) -> Graph -> Graph
updateManyBody up (Graph p) =
    Graph { p | manyBody = up p.manyBody }


addVertexAndGetTheNewVertexId : { x : Int, y : Int } -> ( Vertex, Maybe BagId ) -> Graph -> ( Graph, VertexId )
addVertexAndGetTheNewVertexId { x, y } ( v, maybeBagId ) (Graph p) =
    let
        id =
            biggestIdPlusOne p.vertices

        newVertex =
            { v
                | x = toFloat x
                , y = toFloat y
                , inBags =
                    v.inBags
                        |> (case maybeBagId of
                                Just bagId ->
                                    Set.insert bagId

                                Nothing ->
                                    identity
                           )
            }
    in
    ( Graph { p | vertices = Dict.insert id newVertex p.vertices }
    , id
    )


addNeighbour : { x : Int, y : Int } -> VertexId -> ( Vertex, Maybe BagId ) -> Edge -> Graph -> Graph
addNeighbour { x, y } sourceId ( v, maybeBagId ) e ((Graph p) as graph) =
    let
        targetId =
            biggestIdPlusOne p.vertices

        newVertex =
            { v
                | x = toFloat x
                , y = toFloat y
                , inBags =
                    v.inBags
                        |> (case maybeBagId of
                                Just bagId ->
                                    Set.insert bagId

                                Nothing ->
                                    identity
                           )
            }
    in
    graph
        |> mapVertices (Dict.insert targetId newVertex)
        |> mapEdges (Dict.insert ( sourceId, targetId ) e)


devideEdge :
    { x : Int, y : Int }
    -> EdgeId
    -> ( Vertex, Maybe BagId )
    -> Graph
    -> ( Graph, VertexId )
devideEdge pos ( s, t ) ( v, maybeBagId ) graph =
    let
        ( newGraph_, newId ) =
            graph |> addVertexAndGetTheNewVertexId pos ( v, maybeBagId )

        newGraph =
            case getEdge ( s, t ) graph of
                Just e ->
                    newGraph_
                        |> removeEdges (Set.singleton ( s, t ))
                        |> addEdgeBetweenExistingVertices ( s, newId ) e
                        |> addEdgeBetweenExistingVertices ( newId, t ) e

                Nothing ->
                    graph
    in
    ( newGraph, newId )


addNeighbourDevidingEdge :
    VertexId
    -> { x : Int, y : Int }
    -> EdgeId
    -> ( Vertex, Maybe BagId )
    -> Edge
    -> Graph
    -> Graph
addNeighbourDevidingEdge sourceId pos ( s, t ) ( v, maybeBagId ) e graph =
    let
        ( newGraph, newId ) =
            graph |> devideEdge pos ( s, t ) ( v, maybeBagId )
    in
    newGraph |> addEdgeBetweenExistingVertices ( sourceId, newId ) e


addEdgeBetweenExistingVertices : EdgeId -> Edge -> Graph -> Graph
addEdgeBetweenExistingVertices ( s, t ) e graph =
    let
        sourceIsThere =
            Dict.member s (getVertices graph)

        targetIsThere =
            Dict.member t (getVertices graph)
    in
    if sourceIsThere && targetIsThere then
        graph |> mapEdges (Dict.insert ( s, t ) e)

    else
        -- Debug.log "GUI ALLOWED SOMETHING IMPOSSIBLE: cannot add an edge if one of the ends is not there" <|
        graph


removeVertices : Set VertexId -> Graph -> Graph
removeVertices l =
    let
        edgeToRemove ( v, w ) _ =
            not (Set.member v l || Set.member w l)
    in
    mapVertices (\vs -> Set.foldr Dict.remove vs l)
        >> mapEdges (Dict.filter edgeToRemove)


addBagAndGetNewBagId : Set VertexId -> Bag -> Graph -> ( Graph, BagId )
addBagAndGetNewBagId vertexSet bag (Graph p) =
    let
        idOfTheNewBag =
            biggestIdPlusOne p.bags

        updateInBags vertexId v =
            { v
                | inBags =
                    if Set.member vertexId vertexSet then
                        v.inBags |> Set.insert idOfTheNewBag

                    else
                        v.inBags
            }
    in
    ( Graph
        { p
            | vertices = p.vertices |> Dict.map updateInBags
            , bags = p.bags |> Dict.insert idOfTheNewBag bag
        }
    , idOfTheNewBag
    )


removeBag : BagId -> Graph -> Graph
removeBag bagId (Graph p) =
    Graph
        { p
            | vertices =
                p.vertices
                    |> Dict.map
                        (\_ v -> { v | inBags = v.inBags |> Set.remove bagId })
            , bags = p.bags |> Dict.remove bagId
        }


removeEdges : Set EdgeId -> Graph -> Graph
removeEdges l =
    mapEdges (\es -> Set.foldr Dict.remove es l)


updateVertices : Set VertexId -> (Vertex -> Vertex) -> Graph -> Graph
updateVertices l up =
    mapVertices (\vs -> Set.foldr (\v -> Dict.update v (Maybe.map up)) vs l)


updateEdges : Set EdgeId -> (Edge -> Edge) -> Graph -> Graph
updateEdges l up =
    mapEdges
        (\es ->
            Set.foldr
                (\e -> Dict.update e (Maybe.map up))
                es
                l
        )


moveVertices : List { id : VertexId, x : Float, y : Float } -> Graph -> Graph
moveVertices l =
    let
        move { id, x, y } =
            Dict.update id (Maybe.map (\v -> { v | x = x, y = y }))
    in
    mapVertices (\vs -> List.foldr move vs l)


moveCenterX : Set VertexId -> Float -> Graph -> Graph
moveCenterX l x ((Graph ({ vertices } as p)) as graph) =
    let
        centerX =
            getCenter l graph
                |> Maybe.map .x
                |> Maybe.withDefault 0

        move id =
            Dict.update id (Maybe.map (\v -> { v | x = x + v.x - centerX }))
    in
    Graph { p | vertices = Set.foldr move vertices l }


moveCenterY : Set VertexId -> Float -> Graph -> Graph
moveCenterY l y ((Graph ({ vertices } as p)) as graph) =
    let
        centerY =
            getCenter l graph
                |> Maybe.map .y
                |> Maybe.withDefault 0

        move id =
            Dict.update id (Maybe.map (\v -> { v | y = y + v.y - centerY }))
    in
    Graph { p | vertices = Set.foldr move vertices l }


contractEdge : EdgeId -> Vertex -> Graph -> Graph
contractEdge ( s, t ) v ((Graph { vertices }) as graph) =
    let
        newId =
            biggestIdPlusOne vertices

        newVertex =
            case ( Dict.get s vertices, Dict.get t vertices ) of
                ( Just w, Just z ) ->
                    { v
                        | x = (w.x + z.x) / 2
                        , y = (w.y + z.y) / 2
                    }

                _ ->
                    -- Debug.log "GUI ALLOWED SOMETHING IMPOSSIBLE: The vertices should be there!" <|
                    v

        is =
            incomingEdges s graph

        is_ =
            is
                |> Dict.toList
                |> List.filter (\( ( u, _ ), _ ) -> u /= t)
                |> List.map (\( ( u, _ ), e ) -> ( ( u, newId ), e ))
                |> Dict.fromList

        it =
            incomingEdges t graph

        it_ =
            it
                |> Dict.toList
                |> List.filter (\( ( u, _ ), _ ) -> u /= s)
                |> List.map (\( ( u, _ ), e ) -> ( ( u, newId ), e ))
                |> Dict.fromList

        os =
            outgoingEdges s graph

        os_ =
            os
                |> Dict.toList
                |> List.filter (\( ( _, u ), _ ) -> u /= t)
                |> List.map (\( ( _, u ), e ) -> ( ( newId, u ), e ))
                |> Dict.fromList

        ot =
            outgoingEdges t graph

        ot_ =
            ot
                |> Dict.toList
                |> List.filter (\( ( _, u ), _ ) -> u /= s)
                |> List.map (\( ( _, u ), e ) -> ( ( newId, u ), e ))
                |> Dict.fromList

        edgesToRemove =
            is
                |> Dict.union it
                |> Dict.union os
                |> Dict.union ot

        newEdges =
            is_
                |> Dict.union it_
                |> Dict.union os_
                |> Dict.union ot_
    in
    graph
        |> mapVertices
            (Dict.insert newId newVertex
                >> Dict.remove s
                >> Dict.remove t
            )
        |> mapEdges
            ((\es -> Dict.diff es edgesToRemove) >> Dict.union newEdges)


cartesianProduct :
    ( Set VertexId, Set VertexId )
    -> Vertex
    -> Edge
    -> Graph
    -> Graph
cartesianProduct ( vIds, wIds ) vertexProp edgeProp graph =
    let
        handle vId =
            wIds |> Set.toList |> List.map (\wId -> ( vId, wId ))

        verticesOfTheCP =
            vIds
                |> Set.toList
                |> List.concatMap handle
                |> List.map
                    (\( vId, wId ) ->
                        case ( getVertex vId graph, getVertex wId graph ) of
                            ( Just v, Just w ) ->
                                ( ( vId, wId )
                                , { vertexProp
                                    | x = w.x
                                    , y = v.y
                                    , fixed = v.fixed && w.fixed
                                  }
                                )

                            _ ->
                                -- Debug.log "GUI ALLOWED SOMETHING IMPOSSIBLE: The vertices should be there!" <|
                                ( ( 0, 0 ), vertexProp )
                    )
                |> Dict.fromList

        edgesBecauseOfVs =
            graph
                |> inducedEdges vIds
                |> Set.toList
                |> List.concatMap
                    (\( v, v_ ) ->
                        wIds
                            |> Set.toList
                            |> List.map (\wId -> ( ( v, wId ), ( v_, wId ) ))
                    )
                |> List.map (\k -> ( k, edgeProp ))
                |> Dict.fromList

        edgesBecauseOfWs =
            graph
                |> inducedEdges wIds
                |> Set.toList
                |> List.concatMap
                    (\( w, w_ ) ->
                        vIds
                            |> Set.toList
                            |> List.map (\vId -> ( ( vId, w ), ( vId, w_ ) ))
                    )
                |> List.map (\k -> ( k, edgeProp ))
                |> Dict.fromList

        edgesOfTheCP =
            Dict.union edgesBecauseOfVs edgesBecauseOfWs

        ( cP, _, _ ) =
            disjointUnion ( verticesOfTheCP, edgesOfTheCP ) graph
    in
    cP


{-| The good thing about disjointUnion is that it doesn't expect the nre graph to have Int's as vertex id's.
It returns also the ids
-}
disjointUnion :
    ( Dict comparable Vertex, Dict ( comparable, comparable ) Edge )
    -> Graph
    -> ( Graph, Set VertexId, Set EdgeId )
disjointUnion ( verts, edgs ) (Graph p) =
    let
        n =
            biggestIdPlusOne p.vertices

        dictForTheAddedVertices : Dict comparable ( VertexId, Vertex )
        dictForTheAddedVertices =
            verts
                |> Dict.toList
                |> List.indexedMap
                    (\i ( oldId, v ) ->
                        ( oldId
                        , ( n + i, { v | inBags = Set.empty } )
                        )
                    )
                |> Dict.fromList

        newVertices =
            dictForTheAddedVertices
                |> Dict.foldr
                    (\_ ( newId, v ) -> Dict.insert newId v)
                    p.vertices

        addedEdges =
            edgs
                |> Dict.toList
                |> List.map
                    (\( ( oldSourceId, oldTargetId ), e ) ->
                        case ( Dict.get oldSourceId dictForTheAddedVertices, Dict.get oldTargetId dictForTheAddedVertices ) of
                            ( Just ( newSourceId, _ ), Just ( newTargetId, _ ) ) ->
                                ( ( newSourceId, newTargetId ), e )

                            _ ->
                                -- Debug.log "GUI ALLOWED SOMETHING IMPOSSIBLE: At least one edge has an endpoint which is not in verts." <|
                                ( ( 0, 0 ), e )
                    )
                |> Dict.fromList

        newEdges =
            Dict.union addedEdges p.edges
    in
    ( Graph { p | vertices = newVertices, edges = newEdges }
    , dictForTheAddedVertices |> Dict.values |> List.map Tuple.first |> Set.fromList
    , addedEdges |> Dict.keys |> Set.fromList
    )


duplicateSubgraphAndGetTheDuplicate : Set VertexId -> Set EdgeId -> Graph -> ( Graph, Set VertexId, Set EdgeId )
duplicateSubgraphAndGetTheDuplicate vs es graph =
    let
        addedVertices =
            graph
                |> getVertices
                |> Dict.filter (\vertexId _ -> Set.member vertexId vs)

        addedEdges =
            graph
                |> getEdges
                |> Dict.filter (\edgeId _ -> Set.member edgeId es)
    in
    graph |> disjointUnion ( addedVertices, addedEdges )


movePullCenterToCenter : Maybe BagId -> Graph -> Graph
movePullCenterToCenter maybeBagId graph =
    case maybeBagId of
        Nothing ->
            graph

        Just bagId ->
            let
                vs =
                    graph |> getVerticesInBag bagId

                maybeCenter =
                    graph |> getCenter vs

                up bag =
                    case maybeCenter of
                        Nothing ->
                            bag

                        Just { x, y } ->
                            { bag | pullX = x, pullY = y }
            in
            graph |> updateBag bagId up
