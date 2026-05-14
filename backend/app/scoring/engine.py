"""
Scoring Engine for all CodeResidency modules.
"""


def calculate_difficult_client_score(
    constraints_discovered: int,
    constraints_total: int,
    message_scores: list[float],
    code_quality_score: int = 0,
    code_satisfies_reqs: bool = False,
) -> int:
    """
    Difficult Client scoring:
    - Communication Phase (60%):
      - Constraint Discovery: 40%
      - Question Quality: 10%
      - Politeness: 10%
    - Coding Phase (40%):
      - Requirement Satisfaction: 25%
      - Code Quality + Error Handling: 15%
    """
    discovery_rate = constraints_discovered / max(constraints_total, 1)
    discovery_score = discovery_rate * 40  # Up to 40 points

    avg_quality = sum(message_scores) / max(len(message_scores), 1)
    quality_score = min(avg_quality / 10.0, 1.0) * 10  # Up to 10 points

    politeness_score = 10  # Assume polite unless explicitly penalized

    code_req_score = 25 if code_satisfies_reqs else 0
    code_quality_pts = min(code_quality_score, 15)

    total = discovery_score + quality_score + politeness_score + code_req_score + code_quality_pts
    return min(int(total), 100)


def calculate_war_room_score(
    time_used_seconds: int,
    time_limit_seconds: int,
    correct_root_cause: bool,
    systematic_approach: bool,
) -> int:
    """
    War Room scoring formula from spec:
    base_score = 1000
    time_penalty = (time_used / time_limit) * 300
    diagnosis_bonus = 200 if correct_root_cause else 0
    methodology_bonus = 100 if systematic_approach else 0
    final = base - penalty + bonuses (capped to 0-1000, normalized to 100)
    """
    base_score = 1000
    time_penalty = (time_used_seconds / max(time_limit_seconds, 1)) * 300
    diagnosis_bonus = 200 if correct_root_cause else 0
    methodology_bonus = 100 if systematic_approach else 0

    raw = base_score - time_penalty + diagnosis_bonus + methodology_bonus
    # Normalize to 0-100
    normalized = max(0, min(int(raw / 10), 100))
    return normalized


def calculate_gatekeeper_score(
    technical_answers: list[dict],
    behavioral_answers: list[dict],
    resume_integrity: float,
) -> int:
    """
    Gatekeeper scoring:
    - Technical Accuracy (40%)
    - Communication (30%)
    - Composure (15%)
    - Authenticity/Integrity (15%)
    """
    tech_avg = sum(a.get("score", 0) for a in technical_answers) / max(len(technical_answers), 1)
    beh_avg = sum(a.get("score", 0) for a in behavioral_answers) / max(len(behavioral_answers), 1)

    technical = (tech_avg / 100) * 40
    communication = (beh_avg / 100) * 30
    composure = 15  # Default unless explicitly penalized
    integrity = resume_integrity * 15

    return min(int(technical + communication + composure + integrity), 100)


def calculate_imposter_score(
    correct_commit_identified: bool,
    resolution_method: str,
    time_taken_seconds: int,
    time_limit_seconds: int,
    history_intact: bool,
    hints_used: int,
) -> int:
    """
    Imposter scoring:
    - Bug Identification (35%)
    - Resolution Method (30%)
    - Time Efficiency (20%)
    - Repository Safety (15%)
    """
    identification = 35 if correct_commit_identified else 0

    method_scores = {
        "git_revert": 30,
        "git_rebase": 25,
        "manual_fix": 24,
        "git_reset_hard": -30,  # Dangerous
        "git_push_force": -50,  # Very dangerous
    }
    resolution = max(0, method_scores.get(resolution_method, 15))

    time_efficiency = max(0, 20 - (time_taken_seconds / max(time_limit_seconds, 1)) * 20)

    safety = 15 if history_intact else -15

    hint_penalty = min(hints_used * 10, 30)

    total = identification + resolution + time_efficiency + safety - hint_penalty
    return max(0, min(int(total), 100))


def calculate_code_crucible_score(
    passed_cases: int,
    total_cases: int,
    code_quality_score: int,
    time_used_seconds: int,
    time_limit_seconds: int,
) -> int:
    """
    Code Crucible scoring:
    - Test Case Pass Rate: 50 pts
    - Code Quality: 30 pts (from OutputValidatorAgent)
    - Efficiency: 20 pts (time-based)
    """
    # Test Case Pass Rate: 50 pts
    test_score = (passed_cases / max(total_cases, 1)) * 50

    # Code Quality: 30 pts (straight from LLM, already capped at 30)
    quality_score = min(code_quality_score, 30)

    # Efficiency: 20 pts (time-based)
    time_ratio = time_used_seconds / max(time_limit_seconds, 1)
    efficiency_score = max(0, 20 - (time_ratio * 15))  # lose up to 15 pts for slowness

    total = test_score + quality_score + efficiency_score
    return min(int(total), 100)


def score_to_grade(score: int) -> str:
    """Convert numeric score to letter grade."""
    if score >= 95:
        return "A+"
    elif score >= 90:
        return "A"
    elif score >= 85:
        return "B+"
    elif score >= 80:
        return "B"
    elif score >= 75:
        return "C+"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"
