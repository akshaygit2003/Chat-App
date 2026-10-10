import { useAuthContext } from "../../context/AuthContext";
import useVotePoll from "../../hooks/useVotePoll";
import { BsCheckCircleFill, BsCircle } from "react-icons/bs";
import { FaPoll } from "react-icons/fa";

const PollMessage = ({ messageId, poll }) => {
  const { authUser } = useAuthContext();
  const { voteOption, voting } = useVotePoll();

  if (!poll || !poll.options) return null;

  // Calculate total votes across all options
  const totalVotes = poll.options.reduce(
    (acc, opt) => acc + (opt.votes?.length || 0),
    0
  );

  return (
    <div className="w-full max-w-[280px] sm:max-w-[320px] p-2.5 sm:p-3 bg-slate-800/90 rounded-2xl border border-slate-700/80 shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-700/60">
        <div className="flex items-center gap-1.5 text-blue-400">
          <FaPoll className="w-4 h-4 shrink-0" />
          <h4 className="font-bold text-sm text-gray-100 leading-tight">
            {poll.question}
          </h4>
        </div>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider shrink-0 bg-slate-900/60 px-2 py-0.5 rounded-full">
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
        </span>
      </div>

      {/* Options list */}
      <div className="space-y-2">
        {poll.options.map((option) => {
          const voteCount = option.votes?.length || 0;
          const percentage =
            totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
          const hasVoted = option.votes?.some(
            (vId) => vId.toString() === authUser._id.toString()
          );

          return (
            <div
              key={option._id}
              onClick={() => !voting && voteOption(messageId, option._id)}
              className={`relative overflow-hidden p-2.5 rounded-xl border cursor-pointer transition select-none ${
                hasVoted
                  ? "border-blue-500/80 bg-blue-950/30"
                  : "border-slate-700/60 bg-slate-900/40 hover:bg-slate-900/70"
              }`}
            >
              {/* Animated Progress Bar fill */}
              <div
                className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ease-out opacity-20 ${
                  hasVoted ? "bg-blue-500" : "bg-slate-500"
                }`}
                style={{ width: `${percentage}%` }}
              />

              <div className="relative flex items-center justify-between text-xs z-10">
                <div className="flex items-center gap-2 max-w-[75%]">
                  {hasVoted ? (
                    <BsCheckCircleFill className="w-4 h-4 text-blue-400 shrink-0" />
                  ) : (
                    <BsCircle className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                  <span
                    className={`font-medium truncate ${
                      hasVoted ? "text-blue-200 font-semibold" : "text-gray-200"
                    }`}
                  >
                    {option.text}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 text-gray-400">
                  <span className="font-semibold">{percentage}%</span>
                  <span className="text-[10px]">({voteCount})</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-gray-400 mt-2 text-right">
        Tap option to vote / unvote
      </p>
    </div>
  );
};

export default PollMessage;
