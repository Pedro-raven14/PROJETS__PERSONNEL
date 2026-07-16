import FormationsBase from "../../../components/shared/FormationsBase";
import AjoutFormation from "./AjoutFormation";

const Formations = () => (
  <FormationsBase peutCreer={true} visionGlobale={true} AjoutFormationComponent={AjoutFormation} />
);

export default Formations;
