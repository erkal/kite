module TopologicalSorting exposing (InputData, StepData, algorithm)

import Algorithm exposing (Algorithm, StepResult(..))
import IntDict exposing (IntDict)
import Set exposing (Set)


algorithm : Algorithm InputData StepData
algorithm =
    Algorithm.basic
        { init = init
        , step = step
        }



-- InputData


type alias InputData =
    Int


type alias VertexId =
    Int



-- StepData


type alias StepData =
    Int



-- init


init : InputData -> StepData
init _ =
    42



-- step


step : InputData -> StepData -> Algorithm.StepResult StepData
step inputData lastStep =
    End



-- queries
-- helpers
