import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Loader2, Database, FileText, Brain, Code, ShieldCheck, Sparkles } from 'lucide-react';
import { generationWsService, pollEpicGenerationStatus } from '../../services/generationWsService';
import { useAuth } from '../../context/AuthContext';

const STAGES = [
  { id: 'collecting_context', label: 'Сбор данных', icon: Database },
  { id: 'building_prompt', label: 'Формирование запроса', icon: FileText },
  { id: 'calling_llm', label: 'Вызов ИИ-модели', icon: Brain },
  { id: 'parsing_response', label: 'Обработка ответа', icon: Code },
  { id: 'validating', label: 'Валидация', icon: ShieldCheck },
  { id: 'completed', label: 'Завершено', icon: Sparkles },
];

export const GenerationPipeline = ({ epicId, taskId, onCompleted, onFailed }) => {
  const { token } = useAuth();
  const [currentStage, setCurrentStage] = useState(null);
  const [stageMeta, setStageMeta] = useState({});
  const [failed, setFailed] = useState(false);
  const pollingRef = useRef(null);
  const wsConnectedRef = useRef(false);

  useEffect(() => {
    if (!epicId || !taskId) return;

    let cancelled = false;

    // Try WebSocket first
    try {
      generationWsService.connect(token);
      const unsubscribe = generationWsService.subscribe('epic_tasks', taskId, (msg) => {
        if (cancelled) return;
        if (msg.type === 'stage_update') {
          wsConnectedRef.current = true;
          setCurrentStage(msg.stage);
          setStageMeta(msg.stage_meta || {});
          if (msg.stage === 'completed') {
            onCompleted?.();
          }
        }
      });

      // Fallback to polling after 3s if WS doesn't deliver
      const fallbackTimeout = setTimeout(() => {
        if (!wsConnectedRef.current && !cancelled) {
          startPolling();
        }
      }, 3000);

      return () => {
        cancelled = true;
        unsubscribe();
        generationWsService.disconnect();
        clearTimeout(fallbackTimeout);
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    } catch {
      // WS failed, go straight to polling
      startPolling();
      return () => {
        cancelled = true;
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }

    function startPolling() {
      pollingRef.current = setInterval(async () => {
        if (cancelled) return;
        try {
          const status = await pollEpicGenerationStatus(epicId, taskId);
          setCurrentStage(status.stage || status.status);
          setStageMeta(status.stage_meta || {});
          if (status.status === 'completed') {
            clearInterval(pollingRef.current);
            onCompleted?.();
          } else if (status.status === 'failed') {
            clearInterval(pollingRef.current);
            setFailed(true);
            onFailed?.(status);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 3000);
    }
  }, [epicId, taskId, token, onCompleted, onFailed]);

  const currentIdx = STAGES.findIndex(s => s.id === currentStage);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h4 className="text-sm font-bold text-gray-800 mb-4">Генерация задач</h4>

      {failed ? (
        <div className="text-red-500 text-sm font-medium">Ошибка генерации. Попробуйте снова.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = currentIdx > idx || (currentStage === 'completed' && idx === STAGES.length - 1);
            const isActive = currentIdx === idx && currentStage !== 'completed';

            return (
              <div key={stage.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isCompleted ? 'bg-green-50 text-green-500' :
                  isActive ? 'bg-blue-50 text-blue-500' :
                  'bg-gray-50 text-gray-300'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : isActive ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${
                    isCompleted ? 'text-green-600' :
                    isActive ? 'text-blue-600' :
                    'text-gray-400'
                  }`}>
                    {stage.label}
                  </p>
                  {isActive && stageMeta && Object.keys(stageMeta).length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {stageMeta.model && `Модель: ${stageMeta.model}`}
                      {stageMeta.total_tasks && ` | Задач: ${stageMeta.total_tasks}`}
                      {stageMeta.token_estimate && ` | ~${stageMeta.token_estimate} токенов`}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
