module Graph.Extra exposing
    ( contractEdge
    , degree
    , disjointUnion
    , duplicateSubgraph
    , getCommonEdgeProperty
    , getCommonNodeProperty
    , inducedEdges
    , inducedNodes
    , insertEdge
    , insertNode
    , mapNode
    , removeEdge
    , union
    , updateEdges
    , updateEdgesBy
    , updateNodes
    , updateNodesBy
    )

import Graph exposing (Edge, Graph, Node, NodeId)
import IntDict
import Set exposing (Set)


hasEdge : ( NodeId, NodeId ) -> Graph n e -> Bool
hasEdge ( from, to ) graph =
    graph
        |> Graph.get from
        |> Maybe.map (.outgoing >> IntDict.member to)
        |> Maybe.withDefault False


degree : NodeId -> Graph n e -> Int
degree id graph =
    let
        numberOfIncomingEdges =
            graph |> Graph.get id |> Maybe.map (.incoming >> IntDict.size) |> Maybe.withDefault 0

        numberOfOutgoingEdges =
            graph |> Graph.get id |> Maybe.map (.outgoing >> IntDict.size) |> Maybe.withDefault 0
    in
    numberOfIncomingEdges + numberOfOutgoingEdges


insertNode : n -> Graph n e -> ( Graph n e, NodeId )
insertNode n graph =
    let
        newId =
            graph |> Graph.nodeIdRange |> Maybe.map Tuple.second |> Maybe.withDefault 0 |> (+) 1

        newGraph =
            graph
                |> Graph.insert
                    { node =
                        { id = newId
                        , label = n
                        }
                    , incoming = IntDict.empty
                    , outgoing = IntDict.empty
                    }
    in
    ( newGraph, newId )


insertEdge : ( NodeId, NodeId ) -> e -> Graph n e -> Graph n e
insertEdge ( sourceId, targetId ) e graph =
    let
        insertTarget ctx =
            { ctx | outgoing = ctx.outgoing |> IntDict.insert targetId e }

        insertSource ctx =
            { ctx | incoming = ctx.incoming |> IntDict.insert sourceId e }
    in
    graph
        |> Graph.update sourceId (Maybe.map insertTarget)
        |> Graph.update targetId (Maybe.map insertSource)


removeEdge : ( NodeId, NodeId ) -> Graph n e -> Graph n e
removeEdge ( sourceId, targetId ) graph =
    let
        removeFromSource ctx =
            { ctx | outgoing = ctx.outgoing |> IntDict.remove targetId }

        removeFromTarget ctx =
            { ctx | incoming = ctx.incoming |> IntDict.remove sourceId }
    in
    graph
        |> Graph.update sourceId (Maybe.map removeFromSource)
        |> Graph.update targetId (Maybe.map removeFromTarget)


contractEdge : ( NodeId, NodeId ) -> n -> Graph n e -> ( Graph n e, NodeId )
contractEdge ( sourceId, targetId ) label graph =
    let
        newId =
            graph |> Graph.nodeIdRange |> Maybe.map Tuple.second |> Maybe.withDefault 0 |> (+) 1

        newNode =
            { node = { id = newId, label = label }
            , outgoing =
                IntDict.union
                    (graph |> Graph.get sourceId |> Maybe.map .outgoing |> Maybe.withDefault IntDict.empty)
                    (graph |> Graph.get targetId |> Maybe.map .outgoing |> Maybe.withDefault IntDict.empty)
            , incoming =
                IntDict.union
                    (graph |> Graph.get sourceId |> Maybe.map .incoming |> Maybe.withDefault IntDict.empty)
                    (graph |> Graph.get targetId |> Maybe.map .incoming |> Maybe.withDefault IntDict.empty)
            }
    in
    ( graph |> Graph.remove sourceId |> Graph.remove targetId |> Graph.insert newNode
    , newId
    )


{-| Note that this is NOT the disjoint union.

This function is used for the purpose of visualizing a transition that starts with the first graph and ends with the second graph.

This function prioritizes the first argument.
This means that the nodes/edges which lie in the intersection, have the properties which they have in the first graph.

`nodeSeparartion` and `edgeSeparartion` fields return the node/edge partition in the expected order, i.e.

  - first G - H,
  - then G \\cap H,
  - and lastly H - G.

-}
union :
    Graph n e
    -> Graph n e
    ->
        { result : Graph n e
        , nodeSeparation : ( List (Node n), List (Node n), List (Node n) )
        , edgeSeparation : ( List (Edge e), List (Edge e), List (Edge e) )
        }
union g h =
    let
        ( nodesInIntersection, nodesInHButNotInG ) =
            Graph.nodes h
                |> List.partition (\{ id } -> Graph.member id g)

        insertNewNodes g_ =
            nodesInHButNotInG
                |> List.foldr
                    (\node ->
                        Graph.insert
                            { node = node
                            , incoming = IntDict.empty
                            , outgoing = IntDict.empty
                            }
                    )
                    g_

        ( edgesInIntersection, edgesInHButNotInG ) =
            Graph.edges h
                |> List.partition
                    (\{ from, to } -> hasEdge ( from, to ) g)

        insertNewEdges g_ =
            edgesInHButNotInG
                |> List.foldr
                    (\{ from, to, label } -> insertEdge ( from, to ) label)
                    g_
    in
    { result = g |> insertNewNodes |> insertNewEdges
    , nodeSeparation =
        ( Graph.nodes g |> List.filter (\{ id } -> not (Graph.member id h))
        , nodesInIntersection
        , nodesInHButNotInG
        )
    , edgeSeparation =
        ( Graph.edges g
            |> List.filter (\{ from, to } -> not (hasEdge ( from, to ) h))
        , edgesInIntersection
        , edgesInHButNotInG
        )
    }


disjointUnion :
    Graph n e
    -> Graph n e
    ->
        { result : Graph n e
        , verticesOfTheFirstGraphShifted : List NodeId
        , edgesOfTheFirstGraphShifted : List ( NodeId, NodeId )
        }
disjointUnion g h =
    let
        ( maxH, minG ) =
            ( h |> Graph.nodeIdRange |> Maybe.map Tuple.second |> Maybe.withDefault 0
            , g |> Graph.nodeIdRange |> Maybe.map Tuple.first |> Maybe.withDefault 0
            )

        delta =
            maxH - minG + 1

        shiftForAdjacency =
            IntDict.toList
                >> List.map (\( id, e ) -> ( id + delta, e ))
                >> IntDict.fromList

        shift { node, incoming, outgoing } =
            { node = { node | id = node.id + delta }
            , incoming = incoming |> shiftForAdjacency
            , outgoing = outgoing |> shiftForAdjacency
            }

        gShifted =
            g |> Graph.mapContexts shift
    in
    { result =
        Graph.fromNodesAndEdges
            (Graph.nodes gShifted ++ Graph.nodes h)
            (Graph.edges gShifted ++ Graph.edges h)
    , verticesOfTheFirstGraphShifted =
        gShifted
            |> Graph.nodeIds
    , edgesOfTheFirstGraphShifted =
        gShifted
            |> Graph.edges
            |> List.map (\{ from, to } -> ( from, to ))
    }


duplicateSubgraph : Set NodeId -> Set ( NodeId, NodeId ) -> Graph n e -> ( Graph n e, List NodeId, List ( NodeId, NodeId ) )
duplicateSubgraph vs es graph =
    let
        subgraph =
            Graph.fromNodesAndEdges
                (graph |> Graph.nodes |> List.filter (\{ id } -> Set.member id vs))
                (graph |> Graph.edges |> List.filter (\{ from, to } -> Set.member ( from, to ) es))

        { result, verticesOfTheFirstGraphShifted, edgesOfTheFirstGraphShifted } =
            disjointUnion subgraph graph
    in
    ( result, verticesOfTheFirstGraphShifted, edgesOfTheFirstGraphShifted )


updateNodes : Set NodeId -> (n -> n) -> Graph n e -> Graph n e
updateNodes nodeSetToUpdate up graph =
    let
        up_ ({ node } as ctx) =
            { ctx | node = { node | label = up node.label } }
    in
    Set.foldr (\id -> Graph.update id (Maybe.map up_)) graph nodeSetToUpdate


mapNode : NodeId -> (n -> n) -> Graph n e -> Graph n e
mapNode id up graph =
    updateNodes (Set.singleton id) up graph


updateEdges : Set ( NodeId, NodeId ) -> (e -> e) -> Graph n e -> Graph n e
updateEdges edgeSetToUpdate up graph =
    let
        newEdges =
            graph
                |> Graph.edges
                |> List.map
                    (\({ from, to, label } as edge) ->
                        if Set.member ( from, to ) edgeSetToUpdate then
                            { edge | label = up label }

                        else
                            edge
                    )
    in
    Graph.fromNodesAndEdges (Graph.nodes graph) newEdges


updateNodesBy : List ( NodeId, a ) -> (a -> n -> n) -> Graph n e -> Graph n e
updateNodesBy l upBy graph =
    let
        ctxUpdater upData ({ node } as ctx) =
            { ctx | node = { node | label = upBy upData node.label } }

        updateNodeProperties ( id, upData ) acc =
            Graph.update id (Maybe.map (ctxUpdater upData)) acc
    in
    List.foldr updateNodeProperties graph l


updateEdgesBy : List ( ( NodeId, NodeId ), a ) -> (a -> e -> e) -> Graph n e -> Graph n e
updateEdgesBy l upBy graph =
    let
        up_ to upData =
            IntDict.update to (Maybe.map (upBy upData))

        ctxUpdaterForOutgoing to upData ctx =
            { ctx | outgoing = up_ to upData ctx.outgoing }

        ctxUpdaterForIncoming from upData ctx =
            { ctx | incoming = up_ from upData ctx.incoming }

        updateEdgeProperties ( ( from, to ), upData ) acc =
            acc
                |> Graph.update from (Maybe.map (ctxUpdaterForOutgoing to upData))
                |> Graph.update to (Maybe.map (ctxUpdaterForIncoming from upData))
    in
    List.foldr updateEdgeProperties graph l


deleteDuplicates : List a -> List a
deleteDuplicates xs =
    case xs of
        x :: rest ->
            x :: deleteDuplicates (List.filter ((/=) x) rest)

        [] ->
            []


getCommonNodeProperty : Set NodeId -> (n -> a) -> Graph n e -> Maybe a
getCommonNodeProperty vs prop graph =
    let
        l =
            graph
                |> Graph.nodes
                |> List.filterMap
                    (\{ id, label } ->
                        if Set.member id vs then
                            Just (prop label)

                        else
                            Nothing
                    )
                |> deleteDuplicates
    in
    case l of
        [ unique ] ->
            Just unique

        _ ->
            Nothing


getCommonEdgeProperty : Set ( NodeId, NodeId ) -> (e -> a) -> Graph n e -> Maybe a
getCommonEdgeProperty vs prop graph =
    let
        l =
            graph
                |> Graph.edges
                |> List.filterMap
                    (\{ from, to, label } ->
                        if Set.member ( from, to ) vs then
                            Just (prop label)

                        else
                            Nothing
                    )
                |> deleteDuplicates
    in
    case l of
        [ unique ] ->
            Just unique

        _ ->
            Nothing


inducedNodes : Set ( NodeId, NodeId ) -> Set NodeId
inducedNodes =
    Set.toList >> List.concatMap (\( s, t ) -> [ s, t ]) >> Set.fromList


inducedEdges : Set NodeId -> Graph n e -> Set ( NodeId, NodeId )
inducedEdges vs graph =
    graph
        |> Graph.edges
        |> List.filter (\{ from, to } -> Set.member from vs && Set.member to vs)
        |> List.map (\{ from, to } -> ( from, to ))
        |> Set.fromList
