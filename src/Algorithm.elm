module Algorithm exposing (StepResult(..), run)


type StepResult stepData
    = Next stepData
    | End


{-| stepData must hold all information for the visualization of that step.
-}
run :
    { init : inputData -> stepData
    , step : inputData -> stepData -> StepResult stepData
    }
    -> inputData
    -> List stepData
run { init, step } inputData =
    let
        helper : stepData -> List stepData -> List stepData
        helper lastStepData past =
            case step inputData lastStepData of
                Next nextStepData ->
                    helper nextStepData (lastStepData :: past)

                End ->
                    lastStepData :: past
    in
    helper (init inputData) []
