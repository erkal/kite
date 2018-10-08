module Graph.Extra exposing
    ( contractEdge
    , duplicateSubgraph
    , getCommonEdgeProperty
    , getCommonNodeProperty
    , inducedEdges
    , inducedNodes
    , insertEdge
    , insertNode
    , removeEdge
    , updateEdges
    , updateNodes
    , updateNodesBy
    )

import Graph exposing (Graph, NodeId)
import IntDict
import Set exposing (Set)


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
        insertTarget ({ outgoing } as ctx) =
            { ctx | outgoing = ctx.outgoing |> IntDict.insert targetId e }

        insertSource ({ incoming } as ctx) =
            { ctx | incoming = ctx.incoming |> IntDict.insert sourceId e }
    in
    graph
        |> Graph.update sourceId (Maybe.map insertTarget)
        |> Graph.update targetId (Maybe.map insertSource)


removeEdge : ( NodeId, NodeId ) -> Graph n e -> Graph n e
removeEdge ( sourceId, targetId ) graph =
    let
        removeFromSource ({ outgoing } as ctx) =
            { ctx | outgoing = ctx.outgoing |> IntDict.remove targetId }

        removeFromTarget ({ incoming } as ctx) =
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


updateNodesBy : List ( NodeId, a ) -> (a -> n -> n) -> Graph n e -> Graph n e
updateNodesBy l upBy graph =
    let
        ctxUpdater upData ({ node } as ctx) =
            { ctx | node = { node | label = upBy upData node.label } }

        updateNodeProperties ( id, upData ) acc =
            Graph.update id (Maybe.map (ctxUpdater upData)) acc
    in
    List.foldr updateNodeProperties graph l


disjointUnion : Graph n e -> Graph n e -> { union : Graph n e, verticesOfTheFirstGraphShifted : List NodeId, edgesOfTheFirstGraphShifted : List ( NodeId, NodeId ) }
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
    { union =
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

        { union, verticesOfTheFirstGraphShifted, edgesOfTheFirstGraphShifted } =
            disjointUnion subgraph graph
    in
    ( union, verticesOfTheFirstGraphShifted, edgesOfTheFirstGraphShifted )


updateEdges : Set ( NodeId, NodeId ) -> (e -> e) -> Graph n e -> Graph n e
updateEdges edgeSetToUpdate up graph =
    let
        newEdges =
            graph
                |> Graph.edges
                |> List.map
                    (\({ from, to, label } as edge) ->
                        if Set.member ( from, to ) edgeSetToUpdate then
                            { edge | label = up edge.label }

                        else
                            edge
                    )
    in
    Graph.fromNodesAndEdges (Graph.nodes graph) newEdges


updateNodes : Set NodeId -> (n -> n) -> Graph n e -> Graph n e
updateNodes nodeSetToUpdate up graph =
    let
        up_ ({ node } as ctx) =
            { ctx | node = { node | label = up node.label } }
    in
    nodeSetToUpdate |> Set.foldr (\id -> Graph.update id (Maybe.map up_)) graph


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
        |> List.filter (\{ from, to, label } -> Set.member from vs && Set.member to vs)
        |> List.map (\{ from, to } -> ( from, to ))
        |> Set.fromList
