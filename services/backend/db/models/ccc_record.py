from pydantic import BaseModel, Field


class FormatStatus(BaseModel):
    applicable: str | None = None
    cleared: str | None = None


class TeamHandover(BaseModel):
    engineering: str | None = None
    procurement: str | None = None
    quality: str | None = None
    civil: str | None = None
    mechanical: str | None = None
    electrical: str | None = None
    c_and_i: str | None = None


class CCCRecord(BaseModel):
    priority_type: str | None = None
    department: str | None = None
    section_number: str | None = None
    section_name: str | None = None
    serial_number: str | None = None
    kks_code: str | None = None
    kks_description: str | None = None
    ccc_number_full: str | None = None
    ccc_number_part: str | None = None
    part_or_full: str | None = None
    active_ccc_number: str | None = None
    ccc_description: str | None = None
    format_1: FormatStatus = Field(default_factory=FormatStatus)
    format_2: FormatStatus = Field(default_factory=FormatStatus)
    format_3: FormatStatus = Field(default_factory=FormatStatus)
    format_4: FormatStatus = Field(default_factory=FormatStatus)
    format_5: FormatStatus = Field(default_factory=FormatStatus)
    ccc_status: str = "Pending"
    hd_report: str | None = None
    erection_report_1: str | None = None
    erection_report_2: str | None = None
    team_handover: TeamHandover = Field(default_factory=TeamHandover)
    target_date: str | None = None
    excel_row: int | None = None
