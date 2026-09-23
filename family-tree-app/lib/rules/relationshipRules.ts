export {
  RelationshipRuleError,
  ancestorIds,
  assertCanAssignParents,
  assertCanAttachChild,
  assertCanCreateMarriage,
  assertLifeDates,
  assertMarriageTimeline,
  assertPersonDatesAgainstMarriages,
  canonicalPartnerIds,
  dateOnly,
  defaultSpouseGender,
  descendantIds,
  findMarriage,
  ruleMessages,
  toUserFacingMessage,
} from "../../../shared/relationshipRules";

export type {
  RuleCode,
  RuleGender,
  RuleGraph,
  RulePerson,
  RuleUnion,
} from "../../../shared/relationshipRules";
