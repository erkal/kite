module Digraph exposing (..)

import Html exposing (Html, div)
import Dict exposing (Dict, insert)
import Svg exposing (Svg, svg, circle, line, rect, path)
import Svg.Attributes exposing (textAnchor, transform, id, cx, cy, r, strokeDasharray, x1, x2, y1, y2, width, height, rx, class, x, y, fontSize, d, fill, stroke, opacity, strokeWidth, strokeLinejoin)
import Debug exposing (crash)
import SvgHelpers
import ConvexHull
import BasicGeometry exposing (Point)
import Extras
import PanAndZoom.Basics as PB exposing (ScaleAndTranslate)


-- MODEL


type alias VertexName =
    String


type alias EdgeName =
    ( VertexName, VertexName )


type alias Model =
    { vertices : Dict VertexName VertexProp
    , edges : Dict EdgeName EdgeProp
    , scaleAndTranslate : ScaleAndTranslate
    }


type alias VertexProp =
    { label : Maybe String {- TODO: Show labels in demand -}
    , position : Point
    , radius : Float
    , color : String {- TODO: Add stroke and strokeWidth -}
    , hullId : Maybe String
    , force : NodeForceData
    }


type alias NodeForceData =
    { gC : Maybe Point {- Gravity center for D3Force -}
    , pullStrengthTogC : Float
    , fixed : Bool
    , charge : Float
    }


type EdgeShape
    = Standard
    | Arrowed
    | Arc


type alias EdgeProp =
    { color : String
    , thickness : Float
    , shape : EdgeShape
    , force : LinkForceData
    }


type alias LinkForceData =
    { strength : Float
    , distance : Float
    }


empty : Model
empty =
    { vertices = Dict.empty
    , edges = Dict.empty
    , scaleAndTranslate = PB.default
    }


digraph : { vertices : Dict VertexName VertexProp, edges : Dict EdgeName EdgeProp, scaleAndTranslate : ScaleAndTranslate } -> Model
digraph { vertices, edges, scaleAndTranslate } =
    { vertices = vertices
    , edges = edges
    , scaleAndTranslate = scaleAndTranslate
    }


getVertices : Model -> Dict VertexName VertexProp
getVertices =
    .vertices


getEdges : Model -> Dict EdgeName EdgeProp
getEdges =
    .edges


getScaleAndTranslate : Model -> ScaleAndTranslate
getScaleAndTranslate =
    .scaleAndTranslate


standardVertexProp : VertexProp
standardVertexProp =
    { label = Nothing
    , position = ( 0, 0 )
    , radius = 6
    , color = "yellow"
    , hullId = Nothing
    , force = standardNodeForceData
    }


standardNodeForceData : NodeForceData
standardNodeForceData =
    { gC = Nothing
    , pullStrengthTogC = 1
    , fixed = False
    , charge = -100
    }


standardEdgeProp : EdgeProp
standardEdgeProp =
    { color = "white"
    , thickness = 2
    , shape = Standard
    , force = standardLinkForceData
    }


standardLinkForceData : LinkForceData
standardLinkForceData =
    { strength = 0.9
    , distance = 25
    }



-- UPDATE


type Msg
    = AddVertex { vertexName : VertexName, vertexProp : VertexProp }
    | AddEdge { source : VertexName, target : VertexName, edgeProp : EdgeProp }
    | RemoveVertices { vertexNames : List VertexName }
    | RemoveEdges { edgeNames : List EdgeName }
    | SetRadius { newRadius : Float, vertexNames : List VertexName }
    | SetColor { newColor : String, vertexNames : List VertexName }
    | MoveVertices (List { vertexName : VertexName, position : Point })
    | SetScaleAndTranslate ScaleAndTranslate
    | ReplaceBy Model


update : Msg -> Model -> Model
update msg g =
    case msg of
        AddVertex { vertexName, vertexProp } ->
            { g | vertices = g.vertices |> Dict.insert vertexName vertexProp }

        AddEdge { source, target, edgeProp } ->
            { g | edges = g.edges |> insert ( source, target ) edgeProp }

        RemoveVertices { vertexNames } ->
            { g
                | vertices = vertexNames |> List.foldr Dict.remove g.vertices
                , edges = g.edges |> Dict.filter (\( v, w ) _ -> not (List.member v vertexNames) && not (List.member w vertexNames))
            }

        RemoveEdges { edgeNames } ->
            { g | edges = edgeNames |> List.foldr Dict.remove g.edges }

        SetRadius { newRadius, vertexNames } ->
            let
                updateRadius =
                    Maybe.map (\vP -> { vP | radius = newRadius })
            in
                { g | vertices = List.foldr (flip Dict.update updateRadius) g.vertices vertexNames }

        SetColor { newColor, vertexNames } ->
            let
                updateColor =
                    Maybe.map (\vP -> { vP | color = newColor })
            in
                { g | vertices = List.foldr (flip Dict.update updateColor) g.vertices vertexNames }

        MoveVertices l ->
            let
                move { vertexName, position } =
                    Dict.update vertexName (Maybe.map (\prop -> { prop | position = position }))
            in
                { g | vertices = List.foldl move g.vertices l }

        SetScaleAndTranslate m ->
            { g | scaleAndTranslate = m }

        ReplaceBy h ->
            h



-- VIEW
{-
   TODO (?): Would it be more efficient, if I had used
       http://package.elm-lang.org/packages/elm-lang/html/1.1.0/Html-Keyed#node
-}


view : Model -> Html a
view g =
    Svg.g [ transform (PB.extractTransformForSvg g.scaleAndTranslate) ]
        [ drawEdges g
        , drawVertices g
        , drawHulls g
        ]


drawEdges : Model -> Html a
drawEdges g =
    let
        es =
            g.edges
                |> Dict.map (drawEdge g)
                |> Dict.values
    in
        Svg.g [ id "edges" ] es


drawEdge : Model -> EdgeName -> EdgeProp -> Html a
drawEdge g ( s, t ) { color, thickness, shape } =
    case ( (Dict.get s g.vertices), (Dict.get t g.vertices) ) of
        ( Just v, Just w ) ->
            let
                ( vx, vy ) =
                    v.position

                ( wx, wy ) =
                    w.position
            in
                case shape of
                    Standard ->
                        Svg.g []
                            [ line
                                [ stroke color
                                , strokeWidth (toString thickness)
                                , x1 (toString vx)
                                , y1 (toString vy)
                                , x2 (toString wx)
                                , y2 (toString wy)
                                ]
                                []
                            ]

                    Arrowed ->
                        Svg.g []
                            [ line
                                [ stroke color
                                , strokeWidth (toString thickness)
                                , x1 (toString vx)
                                , y1 (toString vy)
                                , x2 (toString wx)
                                , y2 (toString wy)
                                ]
                                []
                            , SvgHelpers.makeArrowHead
                                { sourcePos = v.position
                                , targetPos = w.position
                                , targetRadius = w.radius
                                , color = color
                                }
                            ]

                    Arc ->
                        path
                            [ stroke color
                            , strokeWidth (toString thickness)
                            , fill "none"
                            , d (SvgHelpers.quadraticBezierSymmetric v.position 1 w.position)
                            ]
                            []

        _ ->
            crash ""


drawVertices : Model -> Html a
drawVertices g =
    let
        --drawVertex : comparable -> VertexProp vertexData -> Html a
        drawVertex _ { position, radius, color, label } =
            Svg.g
                [ transform ("translate" ++ toString position) ]
                [ circle
                    [ r (toString radius)
                    , strokeWidth "1px"
                    , stroke "#1d1f21"
                    , fill color
                    ]
                    []
                , Svg.text_
                    [ y (toString (radius / 2))
                    , fill "white"
                    , textAnchor "middle"
                    ]
                    [ Svg.text (Maybe.withDefault "" label) ]
                ]

        vs =
            g.vertices
                |> Dict.map drawVertex
                |> Dict.values
    in
        Svg.g [ id "vertices" ] vs


drawHull : List Point -> Html a
drawHull positions =
    Svg.path
        [ d (positions |> ConvexHull.convexHull |> SvgHelpers.pathdFromPoints)
        , fill "gray"
        , stroke "gray"
        , opacity "0.2"
        , strokeWidth "30px"
        , strokeLinejoin "round"
        ]
        []


drawHulls : Model -> Html a
drawHulls g =
    let
        hullPaths =
            g.vertices
                |> Dict.toList
                |> Extras.groupMaybeBy (Tuple.second >> .hullId)
                |> Dict.map
                    (\hullId verticesInHull ->
                        verticesInHull
                            |> List.map (Tuple.second >> .position)
                            |> drawHull
                    )
                |> Dict.values
    in
        Svg.g [] hullPaths
