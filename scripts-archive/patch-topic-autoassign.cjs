const fs = require('fs');
let code = fs.readFileSync('backend-hudafestival-main/controllers/topicRegistrationController.js', 'utf8');

const submitTopicAutoAssignOld = `        const saved = await registration.save();
        res.status(201).json(saved);
    } catch (error) {`;

const submitTopicAutoAssignNew = `        const saved = await registration.save();
        
        // --- AUTO-ASSIGN LOGIC ---
        // If this is a fixed-list (Team Exclusive) and exactly 1 candidate is left without a topic, and exactly 1 topic is left, auto-assign it.
        if (programme.topicMode === 'fixed-list') {
            const Registration = require('../models/Registration');
            const teamReg = await Registration.findOne({ programme: programmeId, team: teamId });
            if (teamReg && teamReg.candidates && teamReg.candidates.length > 1) {
                const teamTopics = await TopicRegistration.find({ programme: programmeId, team: teamId });
                const submittedCandIds = teamTopics.map(t => t.candidate?.toString());
                const unassignedCands = teamReg.candidates.filter(c => !submittedCandIds.includes(c.toString()));
                
                const submittedTopicStrings = teamTopics.map(t => t.topic);
                const remainingTopics = programme.topicList.filter(t => !submittedTopicStrings.includes(t));
                
                // If remaining counts match, auto-assign
                if (unassignedCands.length > 0 && unassignedCands.length === remainingTopics.length) {
                    for (let i = 0; i < unassignedCands.length; i++) {
                        await TopicRegistration.create({
                            programme: programmeId,
                            team: teamId,
                            candidate: unassignedCands[i],
                            topic: remainingTopics[i],
                            submittedBy: req.user._id,
                            status: 'approved'
                        });
                    }
                }
            }
        }
        
        res.status(201).json(saved);
    } catch (error) {`;

code = code.replace(submitTopicAutoAssignOld, submitTopicAutoAssignNew);

fs.writeFileSync('backend-hudafestival-main/controllers/topicRegistrationController.js', code);
console.log('Patched submitTopic for auto-assign');
