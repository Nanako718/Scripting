import {
  Button,
  Divider,
  HStack,
  Image,
  Label,
  Section,
  Spacer,
  Text,
  VStack,
  useEffect,
  useMemo,
  useState,
} from "scripting"

type SelectOption = {
  id: string
  label: string
  description?: string
}

type SelectOptionsParams = {
  title: string
  description?: string
  options: SelectOption[]
  selectionMode: "single" | "multiple"
  minSelection?: number
  maxSelection?: number
  defaultSelectedIds?: string[]
  submitLabel?: string
  cancelLabel?: string
}

const STATE_SELECTED_IDS = "selectedIds"
const STATE_SUBMITTED = "submitted"

function uniqueStringArray(values: string[]): string[] {
  return Array.from(new Set(values.filter(v => typeof v === "string" && v.length > 0)))
}

function normalizeParams(params: SelectOptionsParams) {
  const options = Array.isArray(params.options)
    ? params.options.filter(item => item && typeof item.id === "string" && typeof item.label === "string")
    : []

  const optionIdSet = new Set(options.map(item => item.id))
  const mode: "single" | "multiple" = params.selectionMode === "multiple" ? "multiple" : "single"

  const defaultSelectedIds = uniqueStringArray(params.defaultSelectedIds ?? []).filter(id => optionIdSet.has(id))
  const selectedIds = mode === "single" ? defaultSelectedIds.slice(0, 1) : defaultSelectedIds

  const minSelection = Math.max(0, Number.isFinite(params.minSelection) ? Number(params.minSelection) : 0)
  const maxSelectionInput = Number.isFinite(params.maxSelection) ? Number(params.maxSelection) : null
  const maxSelection = mode === "multiple" ? maxSelectionInput : 1

  return {
    title: params.title?.trim() || "Please select options",
    description: params.description?.trim() || "",
    options,
    selectionMode: mode,
    minSelection,
    maxSelection,
    defaultSelectedIds: selectedIds,
    submitLabel: params.submitLabel?.trim() || "Confirm",
    cancelLabel: params.cancelLabel?.trim() || "Cancel",
  }
}

function validateSelection(
  selectionMode: "single" | "multiple",
  minSelection: number,
  maxSelection: number | null,
  selectedIds: string[]
): string | null {
  const count = selectedIds.length
  if (count < minSelection) {
    return `Please select at least ${minSelection} option(s).`
  }

  if (selectionMode === "single" && count > 1) {
    return "Only one option can be selected."
  }

  if (maxSelection != null && count > maxSelection) {
    return `You can select up to ${maxSelection} option(s).`
  }

  return null
}

function toOutputText(value: unknown): AssistantToolOutputTextPart {
  return {
    type: "text",
    text: String(value ?? ""),
  }
}

function SelectOptionsView(props: AssistantTool.UIProps<SelectOptionsParams>) {
  const { params, response, isAutoApprove } = props
  const normalized = useMemo(() => normalizeParams(params), [params])

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const saved = AssistantTool.getState<string[]>(STATE_SELECTED_IDS)
    if (!Array.isArray(saved)) {
      return normalized.defaultSelectedIds
    }
    const allowed = new Set(normalized.options.map(item => item.id))
    return uniqueStringArray(saved).filter(id => allowed.has(id))
  })
  const [errorMessage, setErrorMessage] = useState<string>("")

  const [alreadySubmitted, setAlreadySubmitted] = useState(() => AssistantTool.getState<boolean>(STATE_SUBMITTED) === true)

  function updateSelection(next: string[]) {
    AssistantTool.setState(STATE_SELECTED_IDS, next)
    setErrorMessage("")
    setSelectedIds(next)
  }

  function toggleOption(option: SelectOption) {
    try {
      console.log("toggleOption", option)
      if (normalized.selectionMode === "single") {
        updateSelection([option.id])
        return
      }

      const exists = selectedIds.includes(option.id)
      const next = exists ? selectedIds.filter(id => id !== option.id) : [...selectedIds, option.id]
      updateSelection(uniqueStringArray(next))
    } catch (e) {
      console.error("toggleOption error", e)
    }
  }

  function submitSelection() {
    console.log('submitSelection', selectedIds)
    try {
      const validationError = validateSelection(
        normalized.selectionMode,
        normalized.minSelection,
        normalized.maxSelection,
        selectedIds
      )
      if (validationError != null) {
        setErrorMessage(validationError)
        return
      }

      const selectedOptions = normalized.options.filter(item => selectedIds.includes(item.id))
      const selectedLabels = selectedOptions.map(item => item.label)
      AssistantTool.setState(STATE_SELECTED_IDS, selectedIds)
      AssistantTool.setState(STATE_SUBMITTED, true)
      setAlreadySubmitted(true)

      response({
        success: true,
        output: {
          userParts: [toOutputText(`Selected ${selectedLabels.length} option(s): ${selectedLabels.join(", ")}`)],
          assistantParts: [
            toOutputText(
              JSON.stringify({
                title: normalized.title,
                selectionMode: normalized.selectionMode,
                selectedIds,
                selectedLabels,
              })
            ),
          ],
        },
      })
    } catch (e) {
      console.error("submitSelection error", e)
    }
  }

  useEffect(() => {
    // Auto-approve fast path for tools that can skip interaction.
    if (!alreadySubmitted && isAutoApprove && normalized.options.length === 1) {
      const option = normalized.options[0]
      const selected = [option.id]
      AssistantTool.setState(STATE_SELECTED_IDS, selected)
      AssistantTool.setState(STATE_SUBMITTED, true)
      response({
        success: true,
        output: {
          userParts: [toOutputText(`Selected: ${option.label}`)],
          assistantParts: [
            toOutputText(
              JSON.stringify({
                selectionMode: normalized.selectionMode,
                selectedIds: selected,
                selectedLabels: [option.label],
              })
            ),
          ],
        },
      })
    }
  }, [isAutoApprove, normalized, alreadySubmitted])

  return (
    <VStack
      spacing={12}
      alignment="leading"
    >
      <Text>
        {normalized.title}
      </Text>
      <Text
        font={'subheadline'}
        foregroundStyle={'secondaryLabel'}
      >
        {normalized.description}
      </Text>

      <Divider />

      {normalized.options.map(option => {
        const selected = selectedIds.includes(option.id)
        const desc = option.description?.trim() ?? ""
        const systemImage = normalized.selectionMode === "single"
          ? (selected ? "record.circle" : "circle")
          : (selected ? "checkmark.circle.fill" : "circle")
        return (
          <Button
            action={() => {
              toggleOption(option)
            }}
            buttonStyle={'plain'}
          >
            <HStack>
              <Image
                systemName={systemImage}
                foregroundStyle={!selected ? 'tertiaryLabel' : 'accentColor'}
              />
              <VStack alignment="leading">
                <Text>{option.label}</Text>
                {desc != null && <Text font={'footnote'}>{desc}</Text>}
              </VStack>
            </HStack>
          </Button>
        )
      })}

      {errorMessage.length > 0 ? (
        <HStack>
          <Image
            systemName="exclamationmark.triangle.fill"
            foregroundStyle={'systemRed'}
          />
          <Text>{errorMessage}</Text>
        </HStack>
      ) : null}

      <HStack
        spacing={12}
      >
        <Spacer />
        <Button
          title={normalized.submitLabel}
          action={submitSelection}
          buttonStyle={'borderedProminent'}
          buttonBorderShape={'capsule'}
          controlSize={'small'}
        />
        <Spacer />
      </HStack>
    </VStack>
  )
}

const testSelectOptions = AssistantTool.registerUIView<SelectOptionsParams>(SelectOptionsView)

testSelectOptions(
  {
    title: "Choose deployment environments",
    description: "Select environments for this release.",
    selectionMode: "multiple",
    options: [
      { id: "dev", label: "Development" },
      { id: "staging", label: "Staging" },
      { id: "prod", label: "Production" },
    ],
    minSelection: 1,
    maxSelection: 2,
    defaultSelectedIds: ["staging"],
    submitLabel: "Confirm",
    cancelLabel: "Cancel",
  },
  {
    //screenshot: true,
  }
)
