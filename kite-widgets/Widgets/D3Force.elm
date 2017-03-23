port module Widgets.D3Force exposing (..)

import Char
import Dict exposing (Dict)
import Html exposing (Html, div, button, text, p, span, br)
import Html.Attributes exposing (style)
import Keyboard
import BasicGeometry exposing (Point)
import Digraph
import HtmlHelpers exposing (myMaterialButton)
import Material.Icons.Device as MID


widgetName : String
widgetName =
    "D3 Force"



-- MODEL


type alias Model =
    Int


initialModel : Model
initialModel =
    20398



-- UPDATE


port toD3_Fire : ( NodesForD3, LinksForD3 ) -> Cmd msg


type alias NodesForD3 =
    List
        { id : String
        , x : Float
        , y : Float
        , fx : Maybe Float
        , fy : Maybe Float
        , gC : Maybe { x : Float, y : Float }
        , pullStrengthTogC : Float
        , charge : Float
        , radius : Float
        }


type alias LinksForD3 =
    List
        { source : String
        , target : String
        , strength : Float
        , distance : Float
        }


type Msg
    = NoOp
    | ConvertedNodesFromD3 (List { vertexName : String, position : Point })
    | StartForce
    | EndForce



-- | AlphaFromD3 Float


type CallToFileSystem
    = PauseRecording
    | ResumeRecording
    | NoCall


update : Msg -> Digraph.Model -> ( Maybe Digraph.Msg, Cmd e, CallToFileSystem )
update msg graph =
    case msg of
        NoOp ->
            ( Nothing, Cmd.none, NoCall )

        ConvertedNodesFromD3 nl ->
            ( Just (Digraph.MoveVertices nl), Cmd.none, NoCall )

        StartForce ->
            ( Nothing, startForceCmd graph, PauseRecording )

        EndForce ->
            ( Nothing, Cmd.none, ResumeRecording )



-- SUBSCRIPTIONS


port fromD3_Positions : (List { vertexName : String, position : { x : Float, y : Float } } -> msg) -> Sub msg


port fromD3_SimulationEnded : (() -> msg) -> Sub msg


port fromD3_Alpha : (Float -> msg) -> Sub msg


subscriptions : Sub Msg
subscriptions =
    Sub.batch
        [ fromD3_Positions (List.map (\d -> { d | position = ( d.position.x, d.position.y ) }) >> ConvertedNodesFromD3)
        , fromD3_SimulationEnded (\_ -> EndForce)
        , Keyboard.downs
            (\keyCode ->
                if Char.fromCode keyCode == 'F' then
                    StartForce
                else
                    NoOp
            )
        ]



-- HELPERS


startForceCmd : Digraph.Model -> Cmd msg
startForceCmd graph =
    toD3_Fire
        ( createNodesForD3 graph
        , createLinksForD3 graph
        )


createNodesForD3 : Digraph.Model -> NodesForD3
createNodesForD3 graph =
    graph.vertices
        |> Dict.toList
        |> List.map
            (\( vertexName, { position, force, radius } ) ->
                let
                    ( x, y ) =
                        position

                    ( maybefx, maybefy ) =
                        if force.fixed then
                            ( Just x, Just y )
                        else
                            ( Nothing, Nothing )
                in
                    { id = vertexName
                    , x = x
                    , y = y
                    , fx = maybefx
                    , fy = maybefy
                    , gC = force.gC |> Maybe.map (\( x, y ) -> { x = x, y = y })
                    , pullStrengthTogC = force.pullStrengthTogC
                    , charge = force.charge
                    , radius = radius
                    }
            )


createLinksForD3 : Digraph.Model -> LinksForD3
createLinksForD3 graph =
    graph.edges
        |> Dict.toList
        |> List.map
            (\( ( sourceId, targetId ), { force } ) ->
                { source = sourceId
                , target = targetId
                , strength = force.strength
                , distance = force.distance
                }
            )



-- VIEW


viewMenu : Html Msg
viewMenu =
    div []
        [ p [ style [ ( "padding-left", "10px" ) ] ]
            [ myMaterialButton "Start D3Force (F)" MID.battery_charging_full StartForce ]
        ]
