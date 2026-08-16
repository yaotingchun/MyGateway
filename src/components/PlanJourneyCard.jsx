import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Clock,
  Coins,
  Building,
  Zap,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { evaluateStepDependencies } from '../services/journeyService';
import './PlanJourney.css';

export default function PlanJourneyCard({
  journey,
  onStartSubmission,
}) {
  if (!journey || !journey.steps || journey.steps.length === 0) {
    return null;
  }

  // Calculate completed step IDs
  const completedStepIds = journey.steps
    .filter((s) => s.status === 'completed')
    .map((s) => s.id);

  const totalSteps = journey.steps.length;
  const completedCount = completedStepIds.length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  // Evaluate each step's availability and dependency resolution
  const evaluatedSteps = journey.steps.map((step, originalIndex) => {
    const isCompleted = step.status === 'completed';
    const { isUnlocked, missingDependencies } = evaluateStepDependencies(
      step,
      completedStepIds
    );

    // Find missing prerequisite step names
    const missingStepNames = (step.dependencies || [])
      .filter((depId) => !completedStepIds.includes(depId))
      .map((depId) => {
        const target = journey.steps.find((s) => s.id === depId);
        return target ? target.title : depId;
      });

    let state = 'locked';
    if (isCompleted) state = 'completed';
    else if (isUnlocked) state = 'available';

    return {
      ...step,
      originalIndex,
      isCompleted,
      isUnlocked,
      missingDependencies,
      missingStepNames,
      state,
    };
  });

  // Sort steps: Available (Ready to action) first on top, then Completed, and Locked at the bottom
  const sortedSteps = [...evaluatedSteps].sort((a, b) => {
    const statePriority = { available: 1, completed: 2, locked: 3 };
    if (statePriority[a.state] !== statePriority[b.state]) {
      return statePriority[a.state] - statePriority[b.state];
    }
    return a.originalIndex - b.originalIndex;
  });

  const availableCount = evaluatedSteps.filter((s) => s.state === 'available').length;
  const lockedCount = evaluatedSteps.filter((s) => s.state === 'locked').length;

  return (
    <div className="plan-journey-card-root">
      {/* Journey Header */}
      <div className="journey-card-header">
        <div className="journey-header-left">
          <div className="journey-map-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="journey-title">{journey.title || 'Government Application Roadmap'}</h3>
            {journey.summary && <p className="journey-summary">{journey.summary}</p>}
          </div>
        </div>

        <div className="journey-header-stats">
          <div className="stat-circle-box">
            <span className="stat-number">{progressPercent}%</span>
            <span className="stat-label">Progress</span>
          </div>
        </div>
      </div>

      {/* Progress & Quick Stats */}
      <div className="journey-progress-strip">
        <div className="progress-info-row">
          <span className="progress-text">
            {completedCount === totalSteps
              ? '🎉 All applications in this journey are completed!'
              : `${completedCount} of ${totalSteps} applications completed (${availableCount} available to submit now, ${lockedCount} locked)`}
          </span>
          {availableCount > 1 && (
            <div className="journey-quick-pills">
              <span className="pill-parallel">
                <Zap size={11} /> {availableCount} Available in Parallel
              </span>
            </div>
          )}
        </div>
        <div className="journey-progress-bar">
          <div
            className="journey-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Unified Sorted Steps List (Available on top, Locked at bottom) */}
      <div className="journey-steps-linear-list">
        {sortedSteps.map((step) => {
          return (
            <div
              key={step.id}
              className={`journey-step-node ${
                step.isCompleted
                  ? 'step-node-completed'
                  : step.isUnlocked
                  ? 'step-node-unlocked'
                  : 'step-node-locked'
              }`}
            >
              {/* Node Top Row */}
              <div className="step-node-top">
                <div className="node-status-indicator">
                  {step.isCompleted ? (
                    <div className="status-icon-box status-completed">
                      <CheckCircle2 size={16} />
                    </div>
                  ) : step.isUnlocked ? (
                    <div className="status-icon-box status-ready">
                      <Zap size={16} />
                    </div>
                  ) : (
                    <div className="status-icon-box status-locked">
                      <Lock size={16} />
                    </div>
                  )}
                  <div>
                    <span className="step-agency-label">{step.agency}</span>
                    <h5 className="step-title">{step.title}</h5>
                  </div>
                </div>

                <div className="step-badge-tags">
                  {step.isCompleted ? (
                    <span className="badge-tag-completed">Completed</span>
                  ) : step.isUnlocked ? (
                    <span className="badge-tag-ready">Ready to Start</span>
                  ) : (
                    <span className="badge-tag-locked">Locked</span>
                  )}
                </div>
              </div>

              {/* Description */}
              {step.description && (
                <p className="step-description">{step.description}</p>
              )}

              {/* Metadata Row: Duration, Fees, Parallel flag */}
              <div className="step-meta-chips">
                {step.estimatedDuration && (
                  <span className="meta-chip">
                    <Clock size={12} /> {step.estimatedDuration}
                  </span>
                )}
                {step.fees && (
                  <span className="meta-chip">
                    <Coins size={12} /> {step.fees}
                  </span>
                )}
                {step.canRunParallelWith && step.canRunParallelWith.length > 0 && step.isUnlocked && (
                  <span className="meta-chip chip-parallel">
                    <Zap size={12} /> Can be done in parallel
                  </span>
                )}
              </div>

              {/* Produces / Preparation Requirements */}
              <div className="step-artifact-io">
                {step.requires && step.requires.length > 0 && (
                  <div className="artifact-line artifact-requires">
                    <span className="artifact-io-tag requires-tag">Preparation</span>
                    <span>{step.requires.join(' • ')}</span>
                  </div>
                )}

                {step.produces && step.produces.length > 0 && (
                  <div className="artifact-line artifact-produces">
                    <span className="artifact-io-tag produces-tag">Produces</span>
                    <span>{step.produces.join(' • ')}</span>
                  </div>
                )}

                {!step.isUnlocked && step.missingStepNames.length > 0 && (
                  <div className="artifact-line artifact-locked-dep">
                    <span className="artifact-io-tag locked-dep-tag">Required Prior Step</span>
                    <span>Complete {step.missingStepNames.join(' & ')} first</span>
                  </div>
                )}
              </div>

              {/* Step Action Buttons */}
              <div className="step-actions-footer">
                {step.isCompleted ? (
                  <div className="completed-step-summary">
                    <span className="text-success-receipt">
                      ✨ Submitted & Registered
                    </span>
                    {step.submissionRecord?.referenceNumber && (
                      <span className="ref-mini-pill">
                        Ref: {step.submissionRecord.referenceNumber}
                      </span>
                    )}
                  </div>
                ) : step.isUnlocked ? (
                  <div className="unlocked-actions-group">
                    {step.isOnline && (
                      <button
                        className="action-btn-primary"
                        onClick={() => onStartSubmission(step)}
                      >
                        <span>Submit Online via MyGateway</span>
                        <ArrowRight size={14} />
                      </button>
                    )}

                    {step.portalUrl && (
                      <a
                        href={step.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn-secondary"
                      >
                        <span>Official Portal</span>
                        <ExternalLink size={13} />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="locked-notice-footer">
                    <Lock size={13} />
                    <span>Complete prerequisite steps above to unlock this application</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
