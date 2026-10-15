import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  Plus,
  Pencil,
  Eye,
  Trash2,
  MessageSquare,
  Image as ImageIcon,
  Video,
  FileText,
  ExternalLink,
  Reply,
  GalleryHorizontal,
} from 'lucide-react';

import { api } from '@/lib/api';

import {
  PageHeader,
  StatusBadge,
  LoadingState,
  EmptyState,
} from '@/components/shared';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import type { Template } from '@/types';

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const categories = ['Utility', 'Marketing', 'Authentication'];

const templateStatuses = [
  'ALL',
  'APPROVED',
  'PENDING',
  'IN_REVIEW',
  'REJECTED',
  'PAUSED',
  'DISABLED',
  'IN_CHALLENGE',
  'APPEAL_REQUESTED',
];

const languages = [
  'English',
  'French',
  'Spanish',
  'Arabic',
  'Hausa',
  'Yoruba',
  'Igbo',
];

const languageCodes: Record<string, string> = {
  English: 'en_US',
  French: 'fr',
  Spanish: 'es',
  Arabic: 'ar',
  Hausa: 'ha',
  Yoruba: 'yo',
  Igbo: 'ig',
};

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type MetaTemplateButton = {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | string;
  text: string;
  url?: string;
  phone_number?: string;
};

type MetaTemplateExample = {
  body_text_named_params?: Array<{
    param_name: string;
    example: string;
  }>;

  body_text?: string[][];

  header_handle?: string[];
};

type MetaTemplateComponent = {
  type:
    | 'HEADER'
    | 'BODY'
    | 'FOOTER'
    | 'BUTTONS'
    | 'CAROUSEL'
    | string;

  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | string;

  text?: string;

  example?: MetaTemplateExample;

  buttons?: MetaTemplateButton[];

  cards?: Array<{
    components: MetaTemplateComponent[];
  }>;
};

type MetaTemplate = {
  id: string;

  name: string;

  previous_category?: string;

  parameter_format?: 'NAMED' | 'POSITIONAL';

  components: MetaTemplateComponent[];

  language: string;

  status: string;

  category: string;

  disable_ios_autofill?: boolean;

  is_primary_device_delivery_only?: boolean;
};

type MetaTemplatesResponse = {
  data: MetaTemplate[];

  paging?: {
    cursors?: {
      before?: string;
      after?: string;
    };
  };
};

/**
 * Extends your existing Template type with Meta-specific fields.
 */
type FormattedTemplate = Template & {
  parameterFormat?: 'NAMED' | 'POSITIONAL';

  headerFormat?: string;

  rawButtons?: MetaTemplateButton[];

  carousel?: Array<{
    components: MetaTemplateComponent[];
  }>;

  previousCategory?: string;

  disableIosAutofill?: boolean;

  primaryDeviceDeliveryOnly?: boolean;

  examples?: Record<string, string>;

  raw?: MetaTemplate;
};

/* -------------------------------------------------------------------------- */
/*                              HELPER FUNCTIONS                              */
/* -------------------------------------------------------------------------- */

function getVariables(body: string): string[] {
  const matches = body.matchAll(/\{\{([^}]+)\}\}/g);

  return Array.from(new Set(Array.from(matches).map((match) => match[1])));
}

function isValidVariable(
  variable: string,
  parameterFormat: 'NAMED' | 'POSITIONAL',
): boolean {
  return parameterFormat === 'POSITIONAL'
    ? /^\d+$/.test(variable)
    : /^[a-z0-9_]+$/.test(variable);
}

function suggestNamedVariable(variable: string): string {
  return variable
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function getExamples(
  component?: MetaTemplateComponent,
): Record<string, string> {
  const examples: Record<string, string> = {};

  if (!component?.example) {
    return examples;
  }

  component.example.body_text_named_params?.forEach((param) => {
    examples[param.param_name] = param.example;
  });

  if (component.example.body_text?.[0]) {
    component.example.body_text[0].forEach((value, index) => {
      examples[String(index + 1)] = value;
    });
  }

  return examples;
}

/**
 * Convert Meta WhatsApp template format into the structure
 * consumed by the existing UI.
 */
function formatTemplate(template: MetaTemplate): FormattedTemplate {
  const headerComponent = template.components.find(
    (component) => component.type === 'HEADER',
  );

  const bodyComponent = template.components.find(
    (component) => component.type === 'BODY',
  );

  const footerComponent = template.components.find(
    (component) => component.type === 'FOOTER',
  );

  const buttonsComponent = template.components.find(
    (component) => component.type === 'BUTTONS',
  );

  const carouselComponent = template.components.find(
    (component) => component.type === 'CAROUSEL',
  );

  const body = bodyComponent?.text || '';

  const variables = getVariables(body);

  const examples = getExamples(bodyComponent);

  return {
    id: template.id,

    name: template.name,

    category: template.category,

    language: template.language,

    status: template.status,

    header: headerComponent?.text || '',

    body,

    footer: footerComponent?.text || '',

    buttons:
      buttonsComponent?.buttons?.map((button) => button.text) || [],

    variables,

    parameterFormat: template.parameter_format,

    headerFormat: headerComponent?.format,

    rawButtons: buttonsComponent?.buttons || [],

    carousel: carouselComponent?.cards || [],

    previousCategory: template.previous_category,

    disableIosAutofill: template.disable_ios_autofill,

    primaryDeviceDeliveryOnly:
      template.is_primary_device_delivery_only,

    examples,

    raw: template,
  } as FormattedTemplate;
}

/* -------------------------------------------------------------------------- */
/*                                 API CALL                                   */
/* -------------------------------------------------------------------------- */

/**
 * Equivalent curl (all templates):
 *
 * curl -X GET \
 *   'https://glystics.onrender.com/whatsapp/message-templates/{userId}/all' \
 *   -H 'accept: * / *'
 */
async function fetchMessageTemplates(
  userId: string,
  status = 'APPROVED',
): Promise<FormattedTemplate[]> {
  if (!userId) {
    throw new Error(
      'User ID is required to fetch message templates',
    );
  }

  const endpoint =
    status === 'ALL'
      ? `${import.meta.env.VITE_API_URL}/whatsapp/message-templates/${encodeURIComponent(userId)}/all`
      : `${import.meta.env.VITE_API_URL}/whatsapp/message-templates/${encodeURIComponent(userId)}?${new URLSearchParams({ status })}`;
  const response = await fetch(
    endpoint,
    {
      method: 'GET',
      headers: {
        accept: '*/*',
      },
    },
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => null);

    throw new Error(
      error?.message ||
        `Failed to fetch templates: ${response.status} ${response.statusText}`,
    );
  }

  const result: MetaTemplatesResponse =
    await response.json();

    console.log('Backend templates response:', result.data);
console.log(
  'Template statuses:',
  result.data?.map((template) => ({
    name: template.name,
    status: template.status,
  })),
);

  if (!Array.isArray(result.data)) {
    return [];
  }



  return result.data.map(formatTemplate);
}

async function createWhatsAppTemplate(payload: {
  name: string;
  language: string;
  category: string;
  parameter_format: string;
  components: MetaTemplateComponent[];
}): Promise<void> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/whatsapp/message-templates`,
    {
      method: 'POST',
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );

  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = result as
      | { message?: string | string[]; error?: string }
      | null;
    const message = Array.isArray(error?.message)
      ? error.message.join(', ')
      : error?.message ?? error?.error;

    throw new Error(
      message ||
        `Failed to create template: ${response.status} ${response.statusText}`,
    );
  }
}

/* -------------------------------------------------------------------------- */
/*                              MEDIA PLACEHOLDER                             */
/* -------------------------------------------------------------------------- */

function MediaHeader({
  format,
}: {
  format?: string;
}) {
  if (!format || format === 'TEXT') {
    return null;
  }

  if (format === 'IMAGE') {
    return (
      <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-muted">
        <div className="text-center text-muted-foreground">
          <ImageIcon className="mx-auto mb-1 h-7 w-7" />

          <p className="text-xs">Image header</p>
        </div>
      </div>
    );
  }

  if (format === 'VIDEO') {
    return (
      <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-muted">
        <div className="text-center text-muted-foreground">
          <Video className="mx-auto mb-1 h-7 w-7" />

          <p className="text-xs">Video header</p>
        </div>
      </div>
    );
  }

  if (format === 'DOCUMENT') {
    return (
      <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-muted">
        <div className="text-center text-muted-foreground">
          <FileText className="mx-auto mb-1 h-7 w-7" />

          <p className="text-xs">Document header</p>
        </div>
      </div>
    );
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                              WHATSAPP BUTTON                               */
/* -------------------------------------------------------------------------- */

function WhatsAppButton({
  button,
}: {
  button: MetaTemplateButton;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5 border-b border-gray-200 py-2 text-center text-sm font-medium text-[#075e54] last:border-0 dark:border-slate-600 dark:text-emerald-400">
      {button.type === 'URL' ? (
        <ExternalLink className="h-3.5 w-3.5" />
      ) : (
        <Reply className="h-3.5 w-3.5" />
      )}

      {button.text}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              CAROUSEL PREVIEW                              */
/* -------------------------------------------------------------------------- */

function CarouselPreview({
  cards,
}: {
  cards?: FormattedTemplate['carousel'];
}) {
  if (!cards?.length) {
    return null;
  }

  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500">
        <GalleryHorizontal className="h-3.5 w-3.5" />

        {cards.length} carousel cards
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {cards.map((card, index) => {
          const header = card.components.find(
            (component) => component.type === 'HEADER',
          );

          const body = card.components.find(
            (component) => component.type === 'BODY',
          );

          const buttons = card.components.find(
            (component) => component.type === 'BUTTONS',
          );

          return (
            <div
              key={index}
              className="min-w-[210px] overflow-hidden rounded-lg border bg-white dark:bg-slate-700"
            >
              {header?.format === 'IMAGE' && (
                <div className="flex h-24 items-center justify-center bg-muted">
                  <ImageIcon className="h-7 w-7 text-muted-foreground" />
                </div>
              )}

              {header?.format === 'VIDEO' && (
                <div className="flex h-24 items-center justify-center bg-muted">
                  <Video className="h-7 w-7 text-muted-foreground" />
                </div>
              )}

              <div className="p-3">
                {header?.text && (
                  <p className="mb-1 text-sm font-semibold">
                    {header.text}
                  </p>
                )}

                {body?.text && (
                  <p className="text-xs text-gray-700 dark:text-slate-200">
                    {body.text}
                  </p>
                )}
              </div>

              {buttons?.buttons?.map((button, buttonIndex) => (
                <WhatsAppButton
                  key={buttonIndex}
                  button={button}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              WHATSAPP PREVIEW                              */
/* -------------------------------------------------------------------------- */

function WhatsAppPreview({
  template,
}: {
  template: Partial<FormattedTemplate>;
}) {
  const renderBody = (body: string) => {
    return body.replace(
      /\{\{([^}]+)\}\}/g,
      (_, key: string) => {
        const example = template.examples?.[key];

        return example ? example : `[${key}]`;
      },
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <MessageSquare className="h-3 w-3" />
        </div>

        WhatsApp Preview
      </div>

      <div className="w-full max-w-sm rounded-xl bg-[#e5ddd5] p-4 dark:bg-slate-800">
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#075e54] px-3 py-2 text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
            SL
          </div>

          <div>
            <p className="text-sm font-semibold">
              SwiftDrop Logistics
            </p>

            <p className="text-[10px] opacity-80">
              business account
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-700">
          <MediaHeader format={template.headerFormat} />

          {template.header && (
            <p className="mb-2 text-sm font-semibold text-[#075e54] dark:text-emerald-400">
              {template.header}
            </p>
          )}

          {template.body && (
            <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-slate-200">
              {renderBody(template.body)}
            </p>
          )}

          {template.footer && (
            <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
              {template.footer}
            </p>
          )}

          {template.rawButtons &&
            template.rawButtons.length > 0 && (
              <div className="mt-3 border-t border-gray-200 dark:border-slate-600">
                {template.rawButtons.map(
                  (button, index) => (
                    <WhatsAppButton
                      key={index}
                      button={button}
                    />
                  ),
                )}
              </div>
            )}

          {!template.rawButtons?.length &&
            template.buttons &&
            template.buttons.length > 0 && (
              <div className="mt-3 border-t border-gray-200 dark:border-slate-600">
                {template.buttons.map((button, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 py-2 text-center text-sm font-medium text-[#075e54] last:border-0 dark:border-slate-600 dark:text-emerald-400"
                  >
                    {button}
                  </div>
                ))}
              </div>
            )}

          <CarouselPreview cards={template.carousel} />

          <p className="mt-1 text-right text-[10px] text-gray-400 dark:text-slate-500">
            12:30 PM ✓✓
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               TEMPLATE PAGE                                */
/* -------------------------------------------------------------------------- */

export default function TemplatesPage() {
  const queryClient = useQueryClient();

  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('APPROVED');

  const [deleting, setDeleting] =
    useState<FormattedTemplate | null>(null);

  const [previewing, setPreviewing] =
    useState<FormattedTemplate | null>(null);

  const [form, setForm] =
    useState<Partial<FormattedTemplate>>({});

  const [saving, setSaving] = useState(false);

  /* ------------------------------------------------------------------------ */
  /*                               GET TEMPLATES                              */
  /* ------------------------------------------------------------------------ */

const userId: string = localStorage.getItem('userId') ?? '';

const {
  data: templates = [],
  isLoading,
  isError,
  error,
} = useQuery<FormattedTemplate[]>({
  queryKey: ['whatsapp-message-templates', userId, statusFilter],

  queryFn: () => {
    if (!userId) {
      throw new Error('Logged-in user ID not found');
    }

    return fetchMessageTemplates(userId, statusFilter);
  },

  enabled: Boolean(userId),

  staleTime: 0,
  refetchOnMount: 'always',

  refetchOnWindowFocus: false,
});

  /* ------------------------------------------------------------------------ */
  /*                                  EDITOR                                  */
  /* ------------------------------------------------------------------------ */

const openEditor = () => {
  setCreating(true);

  setForm({
    category: 'Utility',
    language: 'English',
    buttons: [],
    variables: [],
    header: '',
    body: '',
    footer: '',
    name: '',
    parameterFormat: 'NAMED',
    headerFormat: 'TEXT',
    rawButtons: [],
    examples: {},
  });
};

const closeEditor = () => {
  setCreating(false);
  setForm({});
};

  /* ------------------------------------------------------------------------ */
  /*                                   SAVE                                   */
  /* ------------------------------------------------------------------------ */

  const handleSave = async () => {
    if (!form.name || !form.body) {
      toast.error(
        'Template name and body are required',
      );

      return;
    }

    const variables = getVariables(form.body);
    const examples = form.examples ?? {};
    const parameterFormat = form.parameterFormat ?? 'NAMED';
    const invalidVariables = variables.filter(
      (variable) => !isValidVariable(variable, parameterFormat),
    );
    const missingExamples = variables.filter(
      (variable) => !examples[variable]?.trim(),
    );

    if (invalidVariables.length > 0) {
      const suggestions = invalidVariables
        .map((variable) => {
          const replacement =
            parameterFormat === 'POSITIONAL'
              ? 'a number such as {{1}}'
              : `{{${suggestNamedVariable(variable)}}}`;
          return `{{${variable}}} → ${replacement}`;
        })
        .join('; ');
      toast.error(
        `Invalid ${parameterFormat.toLowerCase()} placeholder(s): ${suggestions}`,
      );
      return;
    };

    if (missingExamples.length > 0) {
      toast.error(
        `Add example values for: ${missingExamples.join(', ')}`,
      );
      return;
    };

    try {
      setSaving(true);

      const components: MetaTemplateComponent[] = [];

      if (form.header?.trim()) {
        components.push({
          type: 'header',
          format: 'TEXT',
          text: form.header.trim(),
        });
      }

      components.push({
        type: 'body',
        text: form.body.trim(),
        ...(variables.length > 0
          ? {
              example:
                parameterFormat === 'POSITIONAL'
                  ? {
                      body_text: [
                        variables.map((variable) =>
                          examples[variable].trim(),
                        ),
                      ],
                    }
                  : {
                      body_text_named_params: variables.map(
                        (variable) => ({
                          param_name: variable,
                          example: examples[variable].trim(),
                        }),
                      ),
                    },
            }
          : {}),
      });

      if (form.footer?.trim()) {
        components.push({
          type: 'footer',
          text: form.footer.trim(),
        });
      }

      if (form.rawButtons?.length) {
        components.push({
          type: 'buttons',
          buttons: form.rawButtons.map((button) => ({
            ...button,
            type: button.type.toUpperCase(),
          })),
        });
      }

      await createWhatsAppTemplate({
        name: form.name.trim().toLowerCase().replace(/\s+/g, '_'),
        language: languageCodes[form.language ?? 'English'] ?? 'en_US',
        category: (form.category ?? 'Utility').toLowerCase(),
        parameter_format: parameterFormat,
        components,
      });

      toast.success('Template created');

      closeEditor();

      await queryClient.invalidateQueries({
        queryKey: ['whatsapp-message-templates'],
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create template',
      );
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /*                                  DELETE                                  */
  /* ------------------------------------------------------------------------ */

  const handleDelete = async () => {
    if (!deleting) {
      return;
    }

    try {
      await api.deleteTemplate(deleting.id);

      toast.success('Template deleted');

      setDeleting(null);

      await queryClient.invalidateQueries({
        queryKey: ['whatsapp-message-templates'],
      });
    } catch (error) {
      console.error(error);

      toast.error('Failed to delete template');
    }
  };

  // const isEditing = Boolean(editing || creating);
  const isEditing = creating;
  const detectedVariables = getVariables(form.body ?? '');
  const parameterFormat = form.parameterFormat ?? 'NAMED';
  const invalidVariables = detectedVariables.filter(
    (variable) => !isValidVariable(variable, parameterFormat),
  );
  const filteredTemplates = templates.filter(
    (template) =>
      statusFilter === 'ALL' ||
      template.status.toUpperCase() === statusFilter,
  );

  /* ------------------------------------------------------------------------ */
  /*                                  RENDER                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <div>
      <PageHeader
        title="Templates"
        description="Manage your WhatsApp message templates."
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="template-status-filter" className="whitespace-nowrap">
              Status
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="template-status-filter" className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templateStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => openEditor()}>
            <Plus className="mr-2 h-4 w-4" />

            Create Template
          </Button>
        </div>
      </PageHeader>

      {/* Error */}

      {isError && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400">
          <p className="font-medium">
            Failed to load WhatsApp templates
          </p>

          <p className="mt-1 text-xs">
            {error instanceof Error
              ? error.message
              : 'An unexpected error occurred.'}
          </p>
        </div>
      )}

      {/* Templates */}

      {isLoading ? (
        <LoadingState />
      ) : !templates.length ? (
        <EmptyState
          icon={MessageSquare}
          title="No templates yet"
          description="Create your first WhatsApp message template to start sending notifications."
          action={
            <Button onClick={() => openEditor()}>
              <Plus className="mr-2 h-4 w-4" />

              Create Template
            </Button>
          }
        />
      ) : !filteredTemplates.length ? (
        <EmptyState
          icon={MessageSquare}
          title={`No ${statusFilter.replace(/_/g, ' ').toLowerCase()} templates`}
          description={`There are no templates with ${statusFilter.replace(/_/g, ' ')} status. Choose another status to see more templates.`}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
            >
              {/* Title */}

              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold capitalize">
                    {tpl.name.replace(/_/g, ' ')}
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {tpl.category} · {tpl.language}
                  </p>
                </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  tpl.status?.toUpperCase() === 'APPROVED'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {tpl.status}
              </span>
              </div>

              {/* Metadata */}

              <div className="mb-3 flex flex-wrap gap-1.5">
                {tpl.parameterFormat && (
                  <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium">
                    {tpl.parameterFormat}
                  </span>
                )}

                {tpl.headerFormat && (
                  <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium">
                    {tpl.headerFormat}
                  </span>
                )}

                {tpl.carousel?.length ? (
                  <span className="rounded-md bg-muted px-2 py-1 text-[10px] font-medium">
                    {tpl.carousel.length} carousel cards
                  </span>
                ) : null}
              </div>

              {/* Content */}

              <div className="mb-3 rounded-lg bg-muted p-3">
                {tpl.headerFormat &&
                  tpl.headerFormat !== 'TEXT' && (
                    <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                      {tpl.headerFormat === 'IMAGE' && (
                        <ImageIcon className="h-3.5 w-3.5" />
                      )}

                      {tpl.headerFormat === 'VIDEO' && (
                        <Video className="h-3.5 w-3.5" />
                      )}

                      {tpl.headerFormat === 'DOCUMENT' && (
                        <FileText className="h-3.5 w-3.5" />
                      )}

                      {tpl.headerFormat} header
                    </div>
                  )}

                {tpl.header && (
                  <p className="mb-1 text-sm font-medium">
                    {tpl.header}
                  </p>
                )}

                <p className="line-clamp-4 whitespace-pre-wrap text-sm text-muted-foreground">
                  {tpl.body || 'No body text'}
                </p>

                {tpl.footer && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {tpl.footer}
                  </p>
                )}
              </div>

              {/* Variables */}

              {tpl.variables?.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                    Parameters
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {tpl.variables.map((variable) => (
                      <span
                        key={variable}
                        className="rounded-md bg-accent px-2 py-0.5 font-mono text-xs text-accent-foreground"
                      >
                        {`{{${variable}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons */}

              {tpl.rawButtons &&
                tpl.rawButtons.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                      Buttons
                    </p>

                    <div className="space-y-1">
                      {tpl.rawButtons.map(
                        (button, index) => (
                          <div
                            key={`${button.text}-${index}`}
                            className="flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs"
                          >
                            <span className="truncate">
                              {button.text}
                            </span>

                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {button.type.replace(
                                /_/g,
                                ' ',
                              )}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

              {/* Carousel */}

              {tpl.carousel?.length ? (
                <div className="mb-3 flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs text-muted-foreground">
                  <GalleryHorizontal className="h-4 w-4" />

                  {tpl.carousel.length} carousel cards
                </div>
              ) : null}

              {/* Actions */}

              <div className="flex items-center gap-1 border-t border-border pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setPreviewing(tpl)
                  }
                >
                  <Eye className="mr-1 h-3.5 w-3.5" />

                  Preview
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() =>
                    setDeleting(tpl)
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Editor Dialog                                                      */}
      {/* ------------------------------------------------------------------ */}

      <Dialog
        open={isEditing}
        onOpenChange={(open) =>
          !open && closeEditor()
        }
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto scrollbar-thin">
          <DialogHeader>
          <DialogTitle>
            Create Template
          </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Form */}

            <div className="space-y-4">
              {/* Name */}

              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Template name
                </Label>

                <Input
                  id="name"
                  value={form.name || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="pickup_scheduled"
                />
              </div>

              {/* Category + Language */}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Category</Label>

                  <Select
                    value={form.category}
                    onValueChange={(value) =>
                      setForm({
                        ...form,
                        category: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category}
                          value={category}
                        >
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Language</Label>

                  <Select
                    value={form.language}
                    onValueChange={(value) =>
                      setForm({
                        ...form,
                        language: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem
                          key={language}
                          value={language}
                        >
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Parameter format</Label>
                <Select
                  value={form.parameterFormat ?? 'NAMED'}
                  onValueChange={(value: 'NAMED' | 'POSITIONAL') =>
                    setForm({
                      ...form,
                      parameterFormat: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NAMED">Named</SelectItem>
                    <SelectItem value="POSITIONAL">Positional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Header */}

              <div className="space-y-1.5">
                <Label htmlFor="header">
                  Header
                </Label>

                <Input
                  id="header"
                  value={form.header || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      header: e.target.value,
                    })
                  }
                  placeholder="Package Pickup Scheduled"
                />
              </div>

              {/* Body */}

              <div className="space-y-1.5">
                <Label htmlFor="body">
                  Body
                </Label>

                <Textarea
                  id="body"
                  value={form.body || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      body: e.target.value,
                    })
                  }
                  placeholder="Hi {{customer_name}}, your package {{tracking_id}}..."
                  rows={7}
                />

                <p className="text-xs text-muted-foreground">
                  Use {'{{variable}}'} for named
                  parameters or {'{{1}}'} for
                  positional parameters.
                </p>
              </div>

              {/* Footer */}

              <div className="space-y-1.5">
                <Label htmlFor="footer">
                  Footer
                </Label>

                <Input
                  id="footer"
                  value={form.footer || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      footer: e.target.value,
                    })
                  }
                  placeholder="SwiftDrop Logistics"
                />
              </div>

              {/* Buttons */}

              <div className="space-y-1.5">
                <Label>
                  Buttons (one per line)
                </Label>

                <Textarea
                  value={(form.buttons || []).join(
                    '\n',
                  )}
                  onChange={(e) =>
                    setForm({
                      ...form,

                      buttons: e.target.value
                        .split('\n')
                        .map((value) =>
                          value.trim(),
                        )
                        .filter(Boolean),

                      rawButtons: e.target.value
                        .split('\n')
                        .map((value) =>
                          value.trim(),
                        )
                        .filter(Boolean)
                        .map((text) => ({
                          type: 'QUICK_REPLY',
                          text,
                        })),
                    })
                  }
                  placeholder={
                    'Send Package\nTrack Delivery\nCheck Rates'
                  }
                  rows={3}
                />
              </div>

              {/* Variables */}

              {form.body && (
                <div className="space-y-1.5">
                  <Label>
                    Detected parameters
                  </Label>

                  <div className="flex flex-wrap gap-1">
                    {detectedVariables.length > 0 ? (
                      detectedVariables.map(
                        (variable) => (
                          <span
                            key={variable}
                            className={`rounded-md px-2 py-1 font-mono text-xs ${
                              isValidVariable(variable, parameterFormat)
                                ? 'bg-accent'
                                : 'border border-destructive bg-destructive/10 text-destructive'
                            }`}
                          >
                            {`{{${variable}}}`}
                          </span>
                        ),
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No parameters detected.
                      </span>
                    )}
                  </div>
                  {invalidVariables.length > 0 && (
                    <p className="text-xs text-destructive">
                      These placeholders are invalid for {parameterFormat.toLowerCase()} format:{' '}
                      {invalidVariables.map((variable, index) => (
                        <span key={variable}>
                          {index > 0 ? ', ' : ''}
                          <code>{`{{${variable}}}`}</code>
                          {parameterFormat === 'NAMED' &&
                            ` (try {{${suggestNamedVariable(variable)}}})`}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              )}

              {form.body && getVariables(form.body).length > 0 && (
                <div className="space-y-3">
                  <div>
                    <Label>Example values</Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                      WhatsApp requires sample values for template parameters.
                    </p>
                  </div>
                  {getVariables(form.body).map((variable) => (
                    <div key={variable} className="space-y-1.5">
                      <Label htmlFor={`example-${variable}`}>
                        {`{{${variable}}}`}
                      </Label>
                      <Input
                        id={`example-${variable}`}
                        value={form.examples?.[variable] ?? ''}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            examples: {
                              ...form.examples,
                              [variable]: event.target.value,
                            },
                          })
                        }
                        placeholder={`Example for ${variable}`}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preview */}

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <WhatsAppPreview
                template={form}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeEditor}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Preview Dialog                                                     */}
      {/* ------------------------------------------------------------------ */}

      <Dialog
        open={!!previewing}
        onOpenChange={(open) =>
          !open && setPreviewing(null)
        }
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Template Preview
            </DialogTitle>
          </DialogHeader>

          {previewing && (
            <>
              <WhatsAppPreview
                template={previewing}
              />

              <div className="mt-4 rounded-lg border p-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">
                      Template
                    </p>

                    <p className="font-medium">
                      {previewing.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">
                      Status
                    </p>

                    <p className="font-medium">
                      {previewing.status}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">
                      Category
                    </p>

                    <p className="font-medium">
                      {previewing.category}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">
                      Language
                    </p>

                    <p className="font-medium">
                      {previewing.language}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">
                      Parameter format
                    </p>

                    <p className="font-medium">
                      {previewing.parameterFormat ||
                        '—'}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground">
                      Template ID
                    </p>

                    <p className="break-all font-mono font-medium">
                      {previewing.id}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Delete Confirmation                                                */}
      {/* ------------------------------------------------------------------ */}

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) =>
          !open && setDeleting(null)
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete template?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This will permanently delete "
              {deleting?.name}". This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}