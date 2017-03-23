module FileSystem.View.ControlButtons exposing (..)

import Html exposing (Html, p, div)
import Html.Attributes exposing (style)
import FileSystem exposing (..)
import Material.Icons.Action as MIA
import Material.Icons.File as MIF
import Material.Icons.Content as MIC
import Material.Icons.Image as MII
import HtmlHelpers exposing (myMaterialButton)


view : Model file -> Html (Msg file)
view model =
    div []
        [ p [ style [ ( "padding-left", "10px" ) ] ]
            [ myMaterialButton "New File" MIC.add_circle AskForFileNameForNewFile
            , myMaterialButton "Save" MIC.save SaveFocusedFile
            , myMaterialButton "Save As" MII.add_to_photos AskForFileNameForSaveAs
            , myMaterialButton "Delete" MIA.delete DeleteFocusedFile
            ]
        , p [ style [ ( "padding-left", "10px" ) ] ]
            [ myMaterialButton "Export all the file system as json file" MIF.file_upload Export
              --, myMaterialButton "Import file system from json file  (This does not work yet.)" MIF.file_download NoOp
            , myMaterialButton "Undo (Z)" MIC.undo UndoInFocusedFile
            , myMaterialButton "Redo (Y)" MIC.redo RedoInFocusedFile
            ]
        ]
