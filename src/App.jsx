import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { initMIDI, findGp200Output, sendCC, CC, requestPatchName, queryPatchVolume, queryModuleState, MODULE_IDS } from './midi.js';
import {
  Container, DisplayArea, AppTitle, StatusBadge, PatchDisplay, ControlRow, SmallButton,
  Section, SectionTitle, KnobsRow, Knob, KnobLabel, KnobValue, StyledSlider,
  ModulesGrid, ModuleButton, ActionButton, ToggleRow, ToggleLabel, StyledSwitch, CompactGrid
} from './styles.js';

export default function App() {
  const [output, setOutput] = useState(null);
  const [input, setInput] = useState(null);
  const [ready, setReady] = useState(false);
  const [patchName, setPatchName] = useState('');
  const [currentPatch, setCurrentPatch] = useState(0);

  const [sysexLog, setSysexLog] = useState([]);
  const [sysexInput, setSysexInput] = useState('');

  const [patchVol, setPatchVol] = useState(null);
  const [exp1, setExp1] = useState(null);
  const [expMode, setExpMode] = useState(null);
  const [qa1, setQa1] = useState(null);
  const [qa2, setQa2] = useState(null);
  const [qa3, setQa3] = useState(null);

  const [ctrl1, setCtrl1] = useState(null);
  const [ctrl2, setCtrl2] = useState(null);
  const [ctrl3, setCtrl3] = useState(null);
  const [ctrl4, setCtrl4] = useState(null);
  const [ctrl5, setCtrl5] = useState(null);
  const [ctrl6, setCtrl6] = useState(null);
  const [ctrl7, setCtrl7] = useState(null);
  const [ctrl8, setCtrl8] = useState(null);

  const [looperRecVol, setLooperRecVol] = useState(null);
  const [looperPlayVol, setLooperPlayVol] = useState(null);
  const [drumVol, setDrumVol] = useState(null);
  const [drumType, setDrumType] = useState(null);

  const [modules, setModules] = useState({
    PRE: null, DST: null, AMP: null, NR: null, CAB: null,
    EQ: null, MOD: null, DLY: null, RVB: null, WAH: null,
    TUNER: null, LOOPER: null, DRUM: null
  });

  const [looperPlaying, setLooperPlaying] = useState(null);
  const [looperTempo, setLooperTempo] = useState(null);
  const [looperPlayback, setLooperPlayback] = useState(null);
  const [looperPlacement, setLooperPlacement] = useState(null);
  const [drumPlaying, setDrumPlaying] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const access = await initMIDI();
        const outDev = findGp200Output(access);
        const inDev = Array.from(access.inputs.values()).find(i => /GP-200/i.test(i.name));

        setOutput(outDev || null);
        setInput(inDev || null);
        setReady(!!(outDev && inDev));

        if (inDev && outDev) {
          inDev.onmidimessage = (msg) => {
            const data = Array.from(msg.data);

            if (data[0] === 0xF0) {
              const hexMsg = data.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
              setSysexLog(prev => [...prev, { type: 'rx', msg: hexMsg }]);
            }

            if (data[0] === 0xF0 && data[1] === 0x21 && data[2] === 0x25) {
              if (data.length === 30 && data[8] === 0x12 && data[9] === 0x08) {
                if (data[14] === 0x08) {
                  const patchNum = data[26];
                  setCurrentPatch(patchNum);
                  setPatchName('---');
                  setTimeout(() => {
                    requestPatchName(outDev, patchNum);
                    setTimeout(() => queryPatchVolume(outDev), 100);
                    const moduleIds = Object.values(MODULE_IDS);
                    moduleIds.forEach((id, i) => {
                      setTimeout(() => queryModuleState(outDev, id), 200 + (i * 80));
                    });
                  }, 50);
                } else if (data[14] === 0x06) {
                  const volume = (data[25] << 4) | data[26];
                  setPatchVol(volume);
                } else if (data[13] === 0x01 && data[14] === 0x05) {
                  const moduleId = data[22];
                  const state = data[24] === 0x01;

                  if (moduleId === MODULE_IDS.WAH) setModules(prev => ({ ...prev, WAH: state }));
                  else if (moduleId === MODULE_IDS.PRE) setModules(prev => ({ ...prev, PRE: state }));
                  else if (moduleId === MODULE_IDS.AMP) setModules(prev => ({ ...prev, AMP: state }));
                  else if (moduleId === MODULE_IDS.NR) setModules(prev => ({ ...prev, NR: state }));
                  else if (moduleId === MODULE_IDS.CAB) setModules(prev => ({ ...prev, CAB: state }));
                  else if (moduleId === MODULE_IDS.EQ) setModules(prev => ({ ...prev, EQ: state }));
                  else if (moduleId === MODULE_IDS.MOD) setModules(prev => ({ ...prev, MOD: state }));
                  else if (moduleId === MODULE_IDS.DLY) setModules(prev => ({ ...prev, DLY: state }));
                  else if (moduleId === MODULE_IDS.RVB) setModules(prev => ({ ...prev, RVB: state }));
                }
              }

              const name = requestPatchName.parseName(data);
              if (name) setPatchName(name);
            }
          };

          setTimeout(() => {
            queryPatchVolume(outDev);
            const moduleIds = Object.values(MODULE_IDS);
            moduleIds.forEach((id, i) => {
              setTimeout(() => queryModuleState(outDev, id), i * 100);
            });
          }, 200);
        }

        access.onstatechange = () => {
          const updOut = findGp200Output(access);
          const updIn = Array.from(access.inputs.values()).find(i => /GP-200/i.test(i.name));
          setOutput(updOut || null);
          setInput(updIn || null);
          setReady(!!(updOut && updIn));
        };
      } catch (e) {
        setReady(false);
      }
    })();
  }, []);

  const toggleModule = (key, ccNum) => {
    const next = modules[key] === null ? true : !modules[key];
    setModules(prev => ({ ...prev, [key]: next }));
    sendCC(output, ccNum, next ? 127 : 0);
  };

  const toggleState = (current, setter, ccNum) => {
    const next = current === null ? true : !current;
    setter(next);
    sendCC(output, ccNum, next ? 127 : 0);
  };

  const handlePatchChange = (direction) => {
    let newPatch = currentPatch;

    if (direction === 'bank-') {
      sendCC(output, CC.BANK_DEC, 127);
      newPatch = Math.max(0, currentPatch - 4);
    } else if (direction === 'bank+') {
      sendCC(output, CC.BANK_INC, 127);
      newPatch = Math.min(127, currentPatch + 4);
    } else if (direction === 'patch-') {
      sendCC(output, CC.PATCH_DEC, 127);
      newPatch = Math.max(0, currentPatch - 1);
    } else if (direction === 'patch+') {
      sendCC(output, CC.PATCH_INC, 127);
      newPatch = Math.min(127, currentPatch + 1);
    }

    setCurrentPatch(newPatch);
    setTimeout(() => requestPatchName(output, newPatch), 150);
  };

  return (
    <Container>
      <DisplayArea>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2 }}>
          <AppTitle>webGP-200</AppTitle>
          <StatusBadge style={{background: ready ? '#1a4' : '#a33', color: '#fff'}}>
            {ready ? '✓ CONNECTED' : '⚠ NOT CONNECTED'}
          </StatusBadge>
        </Box>

        <PatchDisplay>{patchName || '---'}</PatchDisplay>

        <ControlRow>
          <SmallButton variant="bank" onClick={() => handlePatchChange('bank-')}>BANK-</SmallButton>
          <SmallButton variant="bank" onClick={() => handlePatchChange('bank+')}>BANK+</SmallButton>
          <SmallButton variant="ctrl" onClick={() => sendCC(output, CC.CTRL1, 127)}>CTRL 1</SmallButton>
        </ControlRow>
        <ControlRow>
          <SmallButton variant="slot" onClick={() => handlePatchChange('patch-')}>PREV</SmallButton>
          <SmallButton variant="slot" onClick={() => handlePatchChange('patch+')}>NEXT</SmallButton>
        </ControlRow>
      </DisplayArea>

      <Section>
        <SectionTitle>Levels & Expression</SectionTitle>
        <KnobsRow>
          <Knob>
            <KnobLabel>Patch Vol</KnobLabel>
            <KnobValue>{patchVol ?? '?'}</KnobValue>
            <StyledSlider value={patchVol ?? 50} onChange={(_, v) => { setPatchVol(v); sendCC(output, CC.PATCH_VOL, v); }}
                          min={0} max={100} />
          </Knob>
          <Knob>
            <KnobLabel>EXP 1</KnobLabel>
            <KnobValue>{exp1 ?? '?'}</KnobValue>
            <StyledSlider value={exp1 ?? 50} onChange={(_, v) => { setExp1(v); sendCC(output, CC.EXP1, v); }}
                          min={0} max={100} />
          </Knob>
          <Knob>
            <KnobLabel>QA 1</KnobLabel>
            <KnobValue>{qa1 ?? '?'}</KnobValue>
            <StyledSlider value={qa1 ?? 50} onChange={(_, v) => { setQa1(v); sendCC(output, CC.QA1, v); }}
                          min={0} max={100} />
          </Knob>
          <Knob>
            <KnobLabel>QA 2</KnobLabel>
            <KnobValue>{qa2 ?? '?'}</KnobValue>
            <StyledSlider value={qa2 ?? 50} onChange={(_, v) => { setQa2(v); sendCC(output, CC.QA2, v); }}
                          min={0} max={100} />
          </Knob>
          <Knob>
            <KnobLabel>QA 3</KnobLabel>
            <KnobValue>{qa3 ?? '?'}</KnobValue>
            <StyledSlider value={qa3 ?? 50} onChange={(_, v) => { setQa3(v); sendCC(output, CC.QA3, v); }}
                          min={0} max={100} />
          </Knob>
        </KnobsRow>
        <ToggleRow>
          <ToggleLabel>EXP1 Mode: {expMode === null ? '?' : expMode ? 'B' : 'A'}</ToggleLabel>
          <StyledSwitch state={expMode} checked={expMode === true}
                        onChange={() => toggleState(expMode, setExpMode, CC.EXP1_AB)} />
        </ToggleRow>
      </Section>

      <Section>
        <SectionTitle>Modules</SectionTitle>
        <ModulesGrid>
          <ModuleButton active={modules.PRE} onClick={() => toggleModule('PRE', CC.MOD_PRE)}>PRE</ModuleButton>
          <ModuleButton active={modules.WAH} onClick={() => toggleModule('WAH', CC.MOD_WAH)}>WAH</ModuleButton>
          <ModuleButton active={modules.DST} onClick={() => toggleModule('DST', CC.MOD_DST)}>DST</ModuleButton>
          <ModuleButton active={modules.AMP} onClick={() => toggleModule('AMP', CC.MOD_AMP)}>AMP</ModuleButton>
          <ModuleButton active={modules.NR} onClick={() => toggleModule('NR', CC.MOD_NR)}>NR</ModuleButton>
          <ModuleButton active={modules.CAB} onClick={() => toggleModule('CAB', CC.MOD_CAB)}>CAB</ModuleButton>
          <ModuleButton active={modules.EQ} onClick={() => toggleModule('EQ', CC.MOD_EQ)}>EQ</ModuleButton>
          <ModuleButton active={modules.MOD} onClick={() => toggleModule('MOD', CC.MOD_MOD)}>MOD</ModuleButton>
          <ModuleButton active={modules.DLY} onClick={() => toggleModule('DLY', CC.MOD_DLY)}>DLY</ModuleButton>
          <ModuleButton active={modules.RVB} onClick={() => toggleModule('RVB', CC.MOD_RVB)}>RVB</ModuleButton>
          <ModuleButton active={modules.TUNER} onClick={() => toggleModule('TUNER', CC.TUNER)}>TUNER</ModuleButton>
          <ModuleButton active={modules.LOOPER} onClick={() => toggleModule('LOOPER', CC.LOOPER)}>LOOPER</ModuleButton>
        </ModulesGrid>
      </Section>

      <Section>
        <SectionTitle>Looper</SectionTitle>
        <CompactGrid>
          <ActionButton onClick={() => sendCC(output, CC.LOOPER_RECORD, 127)}>Record</ActionButton>
          <ActionButton onClick={() => sendCC(output, CC.LOOPER_AUTO_REC, 127)}>Auto Rec</ActionButton>
          <ActionButton onClick={() => sendCC(output, CC.DELETE_LOOP, 127)}>Delete</ActionButton>
        </CompactGrid>
        <ToggleRow style={{marginTop: '15px'}}>
          <ToggleLabel>Play: {looperPlaying === null ? '?' : looperPlaying ? 'ON' : 'OFF'}</ToggleLabel>
          <StyledSwitch state={looperPlaying} checked={looperPlaying === true}
                        onChange={() => toggleState(looperPlaying, setLooperPlaying, CC.LOOPER_PLAY)} />
        </ToggleRow>
        <ToggleRow>
          <ToggleLabel>Tempo: {looperTempo === null ? '?' : looperTempo ? 'Normal' : 'Half'}</ToggleLabel>
          <StyledSwitch state={looperTempo} checked={looperTempo === true}
                        onChange={() => toggleState(looperTempo, setLooperTempo, CC.LOOPER_TEMPO)} />
        </ToggleRow>
        <ToggleRow>
          <ToggleLabel>Playback: {looperPlayback === null ? '?' : looperPlayback ? 'Normal' : 'Reverse'}</ToggleLabel>
          <StyledSwitch state={looperPlayback} checked={looperPlayback === true}
                        onChange={() => toggleState(looperPlayback, setLooperPlayback, CC.LOOPER_PLAYBACK)} />
        </ToggleRow>
        <ToggleRow>
          <ToggleLabel>Position: {looperPlacement === null ? '?' : looperPlacement ? 'Pre' : 'Post'}</ToggleLabel>
          <StyledSwitch state={looperPlacement} checked={looperPlacement === true}
                        onChange={() => toggleState(looperPlacement, setLooperPlacement, CC.LOOPER_PLACEMENT)} />
        </ToggleRow>
        <KnobsRow>
          <Knob>
            <KnobLabel>Rec Vol</KnobLabel>
            <KnobValue>{looperRecVol ?? '?'}</KnobValue>
            <StyledSlider value={looperRecVol ?? 50} onChange={(_, v) => { setLooperRecVol(v); sendCC(output, CC.LOOPER_REC_VOL, v); }}
                          min={0} max={100} />
          </Knob>
          <Knob>
            <KnobLabel>Play Vol</KnobLabel>
            <KnobValue>{looperPlayVol ?? '?'}</KnobValue>
            <StyledSlider value={looperPlayVol ?? 50} onChange={(_, v) => { setLooperPlayVol(v); sendCC(output, CC.LOOPER_PLAY_VOL, v); }}
                          min={0} max={100} />
          </Knob>
        </KnobsRow>
      </Section>

      <Section>
        <SectionTitle>Drum Machine</SectionTitle>
        <ToggleRow>
          <ToggleLabel>Play: {drumPlaying === null ? '?' : drumPlaying ? 'ON' : 'OFF'}</ToggleLabel>
          <StyledSwitch state={drumPlaying} checked={drumPlaying === true}
                        onChange={() => toggleState(drumPlaying, setDrumPlaying, CC.DRUM_PLAY)} />
        </ToggleRow>
        <KnobsRow>
          <Knob>
            <KnobLabel>Type</KnobLabel>
            <KnobValue>{drumType ?? '?'}</KnobValue>
            <StyledSlider value={drumType ?? 50} onChange={(_, v) => { setDrumType(v); sendCC(output, CC.DRUM_TYPE, v); }}
                          min={0} max={99} />
          </Knob>
          <Knob>
            <KnobLabel>Volume</KnobLabel>
            <KnobValue>{drumVol ?? '?'}</KnobValue>
            <StyledSlider value={drumVol ?? 50} onChange={(_, v) => { setDrumVol(v); sendCC(output, CC.DRUM_VOL, v); }}
                          min={0} max={100} />
          </Knob>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SmallButton variant="tap" onClick={() => sendCC(output, CC.TAP_TEMPO, 127)}>TAP</SmallButton>
          </Box>
        </KnobsRow>
      </Section>

      {false && (
        <Section>
          <SectionTitle>SYSEX Monitor & Sender</SectionTitle>
          <Box sx={{
            background: '#000',
            border: '1px solid #333',
            borderRadius: '4px',
            padding: '10px',
            height: '300px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px',
            mb: 2
          }}>
            {sysexLog.map((entry, i) => (
              <Box key={i} sx={{ color: entry.type === 'tx' ? '#ffff00' : '#00ffff', mb: 0.5 }}>
                {entry.type === 'tx' ? '>>' : '<<'} {entry.msg}
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <input
              type="text"
              value={sysexInput}
              onChange={(e) => setSysexInput(e.target.value)}
              placeholder="Enter hex bytes (e.g. F0 21 25 ... F7)"
              style={{
                flex: 1,
                background: '#000',
                color: '#0f0',
                border: '1px solid #333',
                padding: '8px',
                fontFamily: 'monospace',
                fontSize: '14px'
              }}
            />
            <Button variant="contained" onClick={() => {
              try {
                const bytes = sysexInput.trim().split(/\s+/).map(b => parseInt(b, 16));
                if (bytes.some(b => isNaN(b) || b < 0 || b > 255)) {
                  alert('Invalid hex bytes');
                  return;
                }
                output?.send(bytes);
                setSysexLog(prev => [...prev, { type: 'tx', msg: bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ') }]);
              } catch (e) {
                alert('Error: ' + e.message);
              }
            }}>Send</Button>
            <Button variant="outlined" onClick={() => setSysexLog([])}>Clear</Button>
          </Box>
          <Typography variant="caption" sx={{ color: '#888' }}>
            TX (yellow), RX (cyan). Adjust controls on GP-200 to see automatic messages.
          </Typography>
        </Section>
      )}
    </Container>
  );
}
