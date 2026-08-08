"use client"

import { useState } from "react"
import { ChevronsUpDown } from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DIAGNOSIS_GROUPS,
  findDiagnosis,
  stagesForDiagnosis,
} from "@/lib/oncology-catalog"

type DiagnosisStageSelectorProps = {
  diagnosis: string
  stage: string
  onDiagnosisChange: (diagnosis: string) => void
  onStageChange: (stage: string) => void
}

const triggerClassName =
  "flex min-h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-left text-[15px] text-slate-900 shadow-sm outline-none transition focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"

export function DiagnosisStageSelector({
  diagnosis,
  stage,
  onDiagnosisChange,
  onStageChange,
}: DiagnosisStageSelectorProps) {
  const [diagnosisOpen, setDiagnosisOpen] = useState(false)
  const [stageOpen, setStageOpen] = useState(false)
  const stageOptions = stagesForDiagnosis(diagnosis)
  const selectedDiagnosis = findDiagnosis(diagnosis)

  function selectDiagnosis(nextDiagnosis: string) {
    onDiagnosisChange(nextDiagnosis)
    onStageChange("")
    setDiagnosisOpen(false)
  }

  function selectStage(nextStage: string) {
    onStageChange(nextStage)
    setStageOpen(false)
  }

  return (
    <>
      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor="diagnosis-picker">
          Diagnosis
        </label>
        <Popover open={diagnosisOpen} onOpenChange={setDiagnosisOpen}>
          <PopoverTrigger id="diagnosis-picker" className={triggerClassName} aria-label="Search and select diagnosis">
            <span className={diagnosis ? "truncate" : "text-slate-400"}>
              {diagnosis || "Search and select diagnosis"}
            </span>
            <ChevronsUpDown className="ml-3 size-4 shrink-0 text-slate-500" aria-hidden="true" />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[min(30rem,calc(100vw-2rem))] p-1">
            <Command>
              <CommandInput placeholder="Search diagnosis, cancer family, or site…" />
              <CommandList>
                <CommandEmpty>No diagnosis found.</CommandEmpty>
                {DIAGNOSIS_GROUPS.flatMap((category) =>
                  category.subgroups.map((subgroup) => (
                    <CommandGroup
                      key={`${category.label}-${subgroup.label ?? "all"}`}
                      heading={subgroup.label ? `${category.label} ${subgroup.label}` : category.label}
                    >
                      {subgroup.diagnoses.map((option) => (
                        <CommandItem
                          key={`${category.label}-${subgroup.label ?? "all"}-${option.label}`}
                          value={`${option.label} ${category.label} ${subgroup.label ?? ""}`}
                          data-checked={diagnosis === option.label ? "true" : undefined}
                          onSelect={() => selectDiagnosis(option.label)}
                        >
                          {option.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor="stage-picker">
          Cancer stage
          {selectedDiagnosis?.stageKey ? " (diagnosis-specific)" : ""}
        </label>
        <Popover open={stageOpen} onOpenChange={setStageOpen}>
          <PopoverTrigger
            id="stage-picker"
            className={triggerClassName}
            aria-label="Search and select cancer stage"
            disabled={!diagnosis}
          >
            <span className={stage ? "truncate" : "text-slate-400"}>
              {stage || (diagnosis ? "Search and select stage" : "Select a diagnosis first")}
            </span>
            <ChevronsUpDown className="ml-3 size-4 shrink-0 text-slate-500" aria-hidden="true" />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[min(30rem,calc(100vw-2rem))] p-1">
            <Command>
              <CommandInput placeholder="Search stage…" />
              <CommandList>
                <CommandEmpty>No stage found.</CommandEmpty>
                <CommandGroup heading={selectedDiagnosis?.stageKey ? "Available staging options" : "Staging options"}>
                  {stageOptions.map((option) => (
                    <CommandItem
                      key={option}
                      value={option}
                      data-checked={stage === option ? "true" : undefined}
                      onSelect={() => selectStage(option)}
                    >
                      {option}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {diagnosis && !selectedDiagnosis?.stageKey && (
          <p className="mt-1 text-xs text-slate-400">
            This diagnosis has no predefined staging system in the supplied catalogue.
          </p>
        )}
      </div>
    </>
  )
}
